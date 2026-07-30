import { Response } from 'express';
import { getGeminiClient } from '../config/gemini';
import { getApifyClient } from '../config/apify';

export type RouteAction =
  | 'NORMAL_CONVERSATION'
  | 'WEBSITE_ANALYSIS'
  | 'GOOGLE_MAPS_SEARCH'
  | 'INSTAGRAM_POSTS'
  | 'INSTAGRAM_REELS'
  | 'INSTAGRAM_COMMENTS'
  | 'FACEBOOK_POSTS'
  | 'FACEBOOK_REELS'
  | 'GENERAL_WEB_SCRAPING';

export interface ClassificationResult {
  action: RouteAction;
  actorId?: string;
  inputPayload?: Record<string, any>;
  reasoning: string;
}

// ─── Prompt Extraction Helpers ───────────────────────────────────────────────

/**
 * Extracts an Instagram username from the prompt.
 */
function extractInstagramUsername(prompt: string): string[] {
  const atMatch = prompt.match(/@([a-zA-Z0-9_.]+)/g);
  if (atMatch) return atMatch.map((m) => m.replace('@', ''));

  const quotedMatch = prompt.match(/["']([a-zA-Z0-9_.]+)["']/g);
  if (quotedMatch) return quotedMatch.map((m) => m.replace(/["']/g, ''));

  const patternMatch = prompt.match(
    /(?:account|profile|user|of|for|named?)\s+([a-zA-Z0-9_.]{2,30})/i
  );
  if (patternMatch) return [patternMatch[1]];

  const igWordMatch = prompt.match(
    /instagram\s+(?:and\s+)?(?:find|scrap[e]?|get|fetch|check|show|search)?\s*([a-zA-Z0-9_.]{2,30})/i
  );
  if (igWordMatch) {
    const candidate = igWordMatch[1].toLowerCase();
    const stopWords = new Set([
      'account', 'profile', 'page', 'posts', 'reels', 'comments', 'data',
      'information', 'details', 'the', 'all', 'from', 'me', 'and', 'for',
      'find', 'give', 'about', 'it', 'my', 'their', 'his', 'her', 'scrape',
      'scrap', 'get', 'fetch', 'search', 'show', 'check', 'that', 'this',
      'followers', 'following', 'engagement', 'likes', 'views',
    ]);
    if (!stopWords.has(candidate)) return [candidate];
  }

  return [];
}

/**
 * Extracts a URL from the prompt
 */
function extractUrl(prompt: string): string | null {
  const match = prompt.match(/https?:\/\/[^\s,)]+/);
  return match ? match[0] : null;
}

/**
 * Extracts a location / search term from the prompt
 */
function extractSearchTerm(prompt: string): string {
  let cleaned = prompt
    .replace(/(?:scrap[e]?|find|search|get|fetch|show|check|give me|tell me about|look up)\s*/gi, '')
    .replace(/(?:instagram|facebook|google maps?|google places|linkedin|amazon)\s*/gi, '')
    .replace(/(?:accounts?|posts?|reels?|comments?|profiles?|pages?|from|and|for|all|the|in|on|at|with|about)\s*/gi, '')
    .replace(/\d+/g, '')
    .trim();

  return cleaned || prompt;
}

/**
 * Extracts a number from the prompt (e.g., "find 10 accounts")
 */
function extractCount(prompt: string, fallback = 10): number {
  const match = prompt.match(/(\d+)/);
  return match ? Math.min(parseInt(match[1], 10), 100) : fallback;
}

/**
 * Helper to build Google Places search terms & location queries
 */
function buildGoogleMapsSearchPayload(prompt: string): { searchStringsArray: string[]; locationQuery: string } {
  const lower = prompt.toLowerCase();

  // Detect location
  let locationQuery = 'Gujarat, India';
  if (lower.includes('ahmedabad')) locationQuery = 'Ahmedabad, Gujarat, India';
  else if (lower.includes('surat')) locationQuery = 'Surat, Gujarat, India';
  else if (lower.includes('vadodara') || lower.includes('baroda')) locationQuery = 'Vadodara, Gujarat, India';
  else if (lower.includes('rajkot')) locationQuery = 'Rajkot, Gujarat, India';
  else if (lower.includes('gujarat')) locationQuery = 'Gujarat, India';

  // Target categories checklist
  const knownCategories = [
    'Restaurants',
    'Hotels',
    'Clinics',
    'Gyms',
    'Salons',
    'Interior Designers',
    'Real Estate',
    'Jewellery',
    'Furniture',
    'Wedding Services',
    'Travel Agencies',
    'Manufacturers',
  ];

  const matchedCategories = knownCategories.filter((cat) => lower.includes(cat.toLowerCase()));

  let searchStringsArray: string[] = [];

  if (matchedCategories.length > 0) {
    searchStringsArray = matchedCategories.map((cat) => `${cat} in ${locationQuery}`);
  } else {
    const cleaned = extractSearchTerm(prompt);
    searchStringsArray = [`${cleaned || 'Businesses'} in ${locationQuery}`];
  }

  return {
    searchStringsArray,
    locationQuery,
  };
}

// ─── Main Orchestration Agent ────────────────────────────────────────────────

export class OrchestrationAgent {
  private static normalizeModelName(modelName: string): string {
    if (!modelName) return 'gemini-2.5-flash';
    if (modelName.startsWith('gemini-1.5')) return 'gemini-2.5-flash';
    if (modelName === 'web-hybrid-v1') return 'gemini-2.5-flash';
    return modelName;
  }

  /**
   * Intelligently classify prompt intent and build the correct Apify actor input
   */
  static async classifyPrompt(prompt: string): Promise<ClassificationResult> {
    const lower = prompt.toLowerCase();

    // ── 1. Google Maps / Business / Lead Search (PRIORITY) ────────────────
    const isGoogleMapsRequest =
      lower.includes('google map') ||
      lower.includes('google places') ||
      lower.includes('businesses') ||
      lower.includes('business') ||
      lower.includes('lead score') ||
      lower.includes('leads') ||
      lower.includes('target:') ||
      lower.includes('restaurant') ||
      lower.includes('hotel') ||
      lower.includes('clinic') ||
      lower.includes('gym') ||
      lower.includes('salon') ||
      lower.includes('interior designer') ||
      lower.includes('real estate') ||
      lower.includes('jewellery') ||
      lower.includes('furniture') ||
      lower.includes('wedding services') ||
      lower.includes('travel agenc') ||
      lower.includes('manufacturer') ||
      (lower.includes('gujarat') && (lower.includes('find') || lower.includes('scrap') || lower.includes('search')));

    if (isGoogleMapsRequest) {
      const { searchStringsArray, locationQuery } = buildGoogleMapsSearchPayload(prompt);
      return {
        action: 'GOOGLE_MAPS_SEARCH',
        actorId: 'compass/crawler-google-places',
        inputPayload: {
          searchStringsArray,
          locationQuery,
          maxCrawledPlacesPerSearch: 10,
          allPlacesNoArea: true,
          language: 'en',
        },
        reasoning: `Scraping Google Places/Businesses in ${locationQuery} for target categories: ${searchStringsArray.slice(0, 3).join(', ')}${searchStringsArray.length > 3 ? '...' : ''}.`,
      };
    }

    // ── 2. Instagram ──────────────────────────────────────────────────────
    if (lower.includes('instagram') || lower.includes('ig reel') || lower.includes('ig post') || lower.includes('insta ')) {
      const usernames = extractInstagramUsername(prompt);
      const resultsLimit = extractCount(prompt, 10);

      if (lower.includes('comment')) {
        const url = extractUrl(prompt);
        return {
          action: 'INSTAGRAM_COMMENTS',
          actorId: 'apify/instagram-comment-scraper',
          inputPayload: {
            directUrls: url ? [url] : usernames.map((u) => `https://www.instagram.com/${u}/`),
            resultsLimit,
          },
          reasoning: `Scraping Instagram comments${url ? ` from ${url}` : usernames.length ? ` for @${usernames[0]}` : ''}.`,
        };
      }

      if (lower.includes('reel')) {
        return {
          action: 'INSTAGRAM_REELS',
          actorId: 'apify/instagram-reel-scraper',
          inputPayload: {
            username: usernames.length ? usernames : ['instagram'],
            resultsLimit,
          },
          reasoning: `Scraping Instagram reels${usernames.length ? ` for @${usernames[0]}` : ''}.`,
        };
      }

      return {
        action: 'INSTAGRAM_POSTS',
        actorId: 'apify/instagram-post-scraper',
        inputPayload: {
          username: usernames.length ? usernames : ['instagram'],
          resultsLimit,
        },
        reasoning: `Scraping Instagram posts${usernames.length ? ` for @${usernames.join(', @')}` : ' (default: @instagram)'}.`,
      };
    }

    // ── 3. Facebook ───────────────────────────────────────────────────────
    if (lower.includes('facebook') || lower.includes('fb ')) {
      const resultsLimit = extractCount(prompt, 10);

      if (lower.includes('reel')) {
        return {
          action: 'FACEBOOK_REELS',
          actorId: 'apify/facebook-reels-scraper',
          inputPayload: { searchQuery: extractSearchTerm(prompt), resultsLimit },
          reasoning: 'Scraping Facebook Reels.',
        };
      }

      return {
        action: 'FACEBOOK_POSTS',
        actorId: 'apify/facebook-posts-scraper',
        inputPayload: {
          startUrls: [{ url: extractUrl(prompt) || 'https://www.facebook.com/' }],
          resultsLimit,
        },
        reasoning: 'Scraping Facebook posts.',
      };
    }

    // ── 4. Website Analysis (URL detected) ────────────────────────────────
    const url = extractUrl(prompt);
    if (url || lower.includes('analyze website') || lower.includes('summarize page') || lower.includes('crawl site')) {
      return {
        action: 'WEBSITE_ANALYSIS',
        actorId: 'apify/website-content-crawler',
        inputPayload: {
          startUrls: [{ url: url || 'https://news.ycombinator.com' }],
          maxCrawlPages: 3,
        },
        reasoning: `Crawling website${url ? `: ${url}` : ''} for content extraction.`,
      };
    }

    // ── 5. Generic Web Scraping ───────────────────────────────────────────
    if (lower.includes('scrape') || lower.includes('scrap ') || lower.includes('fetch live') || lower.includes('search web')) {
      return {
        action: 'GENERAL_WEB_SCRAPING',
        actorId: 'apify/website-content-crawler',
        inputPayload: {
          startUrls: [{ url: `https://www.google.com/search?q=${encodeURIComponent(prompt)}` }],
          maxCrawlPages: 3,
        },
        reasoning: 'General web crawl for live information.',
      };
    }

    // ── 6. Default: Normal Conversation ───────────────────────────────────
    return {
      action: 'NORMAL_CONVERSATION',
      reasoning: 'Direct Gemini AI conversation — no web scraping needed.',
    };
  }

  /**
   * Clean raw Apify dataset records into rich, structured text for Gemini
   */
  private static cleanDataset(items: any[], action: RouteAction): string {
    if (!items || items.length === 0) return '';

    const maxSlice = action === 'GOOGLE_MAPS_SEARCH' ? 100 : 25;

    return items
      .slice(0, maxSlice)
      .map((item, idx) => {
        // Instagram-specific cleaning
        if (action === 'INSTAGRAM_POSTS' || action === 'INSTAGRAM_REELS') {
          const caption = item.caption || item.text || item.alt || '';
          const likes = item.likesCount ?? item.likes ?? 'N/A';
          const comments = item.commentsCount ?? item.comments ?? 'N/A';
          const views = item.videoViewCount ?? item.views ?? '';
          const url = item.url || item.shortCode ? `https://www.instagram.com/p/${item.shortCode}/` : '';
          const date = item.timestamp || item.takenAtTimestamp || '';
          const owner = item.ownerUsername || item.owner?.username || '';

          return [
            `### Post #${idx + 1}`,
            owner ? `- **Author**: @${owner}` : '',
            `- **Caption**: ${caption.slice(0, 500)}`,
            `- **Likes**: ${likes}`,
            `- **Comments**: ${comments}`,
            views ? `- **Views**: ${views}` : '',
            url ? `- **URL**: ${url}` : '',
            date ? `- **Date**: ${date}` : '',
            item.hashtags?.length ? `- **Hashtags**: ${item.hashtags.slice(0, 10).join(', ')}` : '',
          ].filter(Boolean).join('\n');
        }

        if (action === 'INSTAGRAM_COMMENTS') {
          return [
            `### Comment #${idx + 1}`,
            `- **User**: @${item.ownerUsername || item.username || 'unknown'}`,
            `- **Text**: ${(item.text || item.body || '').slice(0, 300)}`,
            `- **Likes**: ${item.likesCount ?? 'N/A'}`,
            item.timestamp ? `- **Date**: ${item.timestamp}` : '',
          ].filter(Boolean).join('\n');
        }

        // Google Maps / Places
        if (action === 'GOOGLE_MAPS_SEARCH') {
          const title = item.title || item.name || 'Unknown Business';
          const city = item.city || (item.address ? item.address.split(',').slice(-3, -1).join(',').trim() : '');
          const rating = item.totalScore !== undefined ? item.totalScore : 'N/A';
          const reviews = item.reviewsCount !== undefined ? item.reviewsCount : 0;
          const phone = item.phone || item.phoneUnformatted || 'N/A';
          const website = item.website || 'No Website';
          const mapsUrl = item.url || item.googleMapsUrl || '';
          const category = item.categoryName || item.category || 'General Business';
          const email = item.email || (item.emails && item.emails[0]) || 'Not listed';
          const instagram = item.instagram || item.instagramUrl || '';
          const facebook = item.facebook || item.facebookUrl || '';
          const linkedin = item.linkedin || item.linkedinUrl || '';

          return [
            `### Business #${idx + 1}: ${title}`,
            `- **Category**: ${category}`,
            city ? `- **City**: ${city}` : '',
            item.address ? `- **Address**: ${item.address}` : '',
            `- **Google Rating**: ${rating}/5 (${reviews} reviews)`,
            `- **Phone**: ${phone}`,
            `- **Website**: ${website}`,
            mapsUrl ? `- **Google Maps URL**: ${mapsUrl}` : '',
            email ? `- **Email**: ${email}` : '',
            instagram ? `- **Instagram**: ${instagram}` : '',
            facebook ? `- **Facebook**: ${facebook}` : '',
            linkedin ? `- **LinkedIn**: ${linkedin}` : '',
          ].filter(Boolean).join('\n');
        }

        // Facebook
        if (action === 'FACEBOOK_POSTS' || action === 'FACEBOOK_REELS') {
          return [
            `### Post #${idx + 1}`,
            item.user?.name ? `- **Author**: ${item.user.name}` : '',
            `- **Text**: ${(item.text || item.message || '').slice(0, 500)}`,
            item.likes ? `- **Likes**: ${item.likes}` : '',
            item.shares ? `- **Shares**: ${item.shares}` : '',
            item.url ? `- **URL**: ${item.url}` : '',
          ].filter(Boolean).join('\n');
        }

        // Website / generic fallback
        const title = item.title || item.name || `Record #${idx + 1}`;
        const text = item.text || item.body || item.description || item.content || '';
        const pageUrl = item.url || '';
        return [
          `### Source #${idx + 1}: ${title}`,
          pageUrl ? `- **URL**: ${pageUrl}` : '',
          `- **Content**: ${text.slice(0, 800)}`,
        ].filter(Boolean).join('\n');
      })
      .join('\n\n---\n\n');
  }

  /**
   * Build the system instruction based on whether we have scraped data
   */
  private static buildSystemInstruction(hasScrapedData: boolean, action: RouteAction): string {
    const base = `You are an expert AI Market Research & Digital Marketing Lead Generation Specialist. You provide structured, accurate, and highly actionable analysis of web and business data. Never reference internal software mechanics, actor IDs, or background scraping pipelines to the user.

PDF EXPORT FEATURE: The user interface includes an instant "Download PDF" button attached directly to every AI response card below the text output. NEVER tell the user "I cannot generate PDFs" or "I am an AI limited to text". If the user asks to download, convert, or export a response/list as a PDF, inform them warmly and clearly that they can click the "Download PDF" button right below your response to save it as a styled PDF document instantly!`;

    if (!hasScrapedData) return base;

    if (action === 'GOOGLE_MAPS_SEARCH') {
      return `${base}

IMPORTANT: You have just received REAL, LIVE GOOGLE MAPS BUSINESS DATA scraped from the web. Attached below is "[SCRAPED DATA]".

Your task:
Analyze all the scraped businesses and perform digital marketing lead qualification.

For EVERY business in the dataset:
1. Extract or evaluate:
   - Business Name
   - Owner (if available in content/website, or state 'Not listed')
   - Category
   - City
   - Google Rating
   - Google Reviews Count
   - Google Maps URL
   - Website
   - Instagram / Facebook / LinkedIn
   - Phone
   - Email
   - Website Score (1-10) - rate based on site presence, design, and modern SEO indicators
   - Instagram Score (1-10) - rate based on social footprint & followers
   - Google Review Score (1-10) - rate based on reviews count and rating
   - Posting Frequency & Average Engagement estimate
   - Lead Score (1-100) - higher score means stronger need for digital marketing services
   - Detailed Reason why they need digital marketing (e.g., website outdated/missing, low Google reviews < 150, weak social presence, poor SEO, missing video/reels)

2. FILTERING CRITERIA:
Only keep businesses that satisfy AT LEAST THREE (3) of these digital weakness indicators:
   - Website older than 3 years or missing/outdated
   - Less than 500 Instagram followers (or missing Instagram)
   - Poor social engagement
   - No reels / video content
   - Irregular posting schedule
   - Weak branding
   - Poor SEO / website performance
   - Google reviews under 150

3. OUTPUT FORMAT:
- Present a comprehensive, beautifully formatted Markdown report.
- Start with an executive summary of total businesses analyzed and qualified leads identified.
- Provide a clean Summary Table listing: Business Name | Category | City | Rating (Reviews) | Website Score | Lead Score | Primary Reason Need Marketing.
- Follow with detailed Lead Cards for target businesses (aim for up to top 50 qualified leads requested).
- Format all information clearly with markdown tables, bold headers, and structured bullet points.`;
    }

    return `${base}

IMPORTANT: You have just received REAL, LIVE DATA that was scraped from the internet moments ago. This data is attached below as "[SCRAPED DATA]". You MUST use this data to answer the user's question. Present the data clearly in a well-structured Markdown format with headings, bullet points, and tables where appropriate.

Do NOT say "I can't browse the internet" or "I don't have access to real-time data" — because you DO have the data right here. Summarize it, analyze it, and present insights based on the scraped results.`;
  }

  /**
   * Execute intelligent orchestration pipeline and stream back via SSE
   */
  static async orchestrateAndStream(prompt: string, rawModelName = 'gemini-2.5-flash', res: Response): Promise<void> {
    const modelName = this.normalizeModelName(rawModelName);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const emitEvent = (event: string, data: Record<string, any>) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    try {
      // 1. Classification & Routing
      emitEvent('progress', {
        phase: 'Selecting Actor',
        message: 'Analyzing prompt intent...',
      });

      const classification = await this.classifyPrompt(prompt);
      console.log(`[Orchestrator] Action: ${classification.action}, Actor: ${classification.actorId || 'none'}`);
      console.log(`[Orchestrator] Input: ${JSON.stringify(classification.inputPayload)}`);

      emitEvent('progress', {
        phase: 'Selecting Actor',
        action: classification.action,
        actor: classification.actorId || 'Direct Gemini AI',
        message: classification.reasoning,
      });

      let researchContext = '';

      // 2. Execute Apify Scraper if needed
      if (classification.action !== 'NORMAL_CONVERSATION' && classification.actorId) {
        emitEvent('progress', {
          phase: 'Running Actor',
          actor: classification.actorId,
          message: `Running [${classification.actorId}]...`,
        });

        try {
          const client = getApifyClient();

          emitEvent('progress', {
            phase: 'Waiting for Results',
            actor: classification.actorId,
            message: 'Waiting for Apify actor to finish...',
          });

          const run = await client
            .actor(classification.actorId)
            .call(classification.inputPayload || {}, {
              waitSecs: 90, // Give sufficient time for multi-query scraping
            });

          emitEvent('progress', {
            phase: 'Processing Dataset',
            actor: classification.actorId,
            datasetId: run.defaultDatasetId,
            message: 'Retrieving dataset results...',
          });

          const datasetLimit = classification.action === 'GOOGLE_MAPS_SEARCH' ? 100 : 25;
          const datasetItems = await client
            .dataset(run.defaultDatasetId)
            .listItems({ limit: datasetLimit });

          researchContext = this.cleanDataset(datasetItems.items, classification.action);

          console.log(`[Orchestrator] Dataset: ${datasetItems.items.length} items, ${researchContext.length} chars`);

          emitEvent('progress', {
            phase: 'Processing Dataset',
            datasetSize: `${(researchContext.length / 1024).toFixed(1)} KB`,
            itemsCount: datasetItems.items.length,
            message: `Scraped ${datasetItems.items.length} records successfully.`,
          });
        } catch (apifyErr: any) {
          console.error('Apify Actor Error:', apifyErr?.message);
          emitEvent('progress', {
            phase: 'Processing Dataset',
            message: `Apify scraping failed: ${apifyErr?.message?.slice(0, 100)}. Falling back to AI knowledge.`,
          });
        }
      } else {
        emitEvent('progress', {
          phase: 'Processing Dataset',
          datasetSize: '0 KB',
          message: 'Direct conversation — no scraping needed.',
        });
      }

      // 3. Thinking with Gemini
      emitEvent('progress', {
        phase: 'Thinking with Gemini',
        message: 'Gemini is analyzing the data...',
      });

      const hasScrapedData = researchContext.length > 0;
      const ai = getGeminiClient();
      const model = ai.getGenerativeModel({
        model: modelName,
        systemInstruction: this.buildSystemInstruction(hasScrapedData, classification.action),
      });

      const finalPrompt = hasScrapedData
        ? `[SCRAPED DATA — Real-time results from Google Maps & Web]\n\n${researchContext}\n\n---\n\n[USER QUESTION / LEAD GENERATION INSTRUCTIONS]\n${prompt}\n\nPlease analyze the scraped data above, apply all lead filtering criteria, calculate scores, and provide a comprehensive lead generation report.`
        : prompt;

      // 4. Streaming Response
      emitEvent('progress', {
        phase: 'Streaming Response',
        message: 'Streaming AI response...',
      });

      const resultStream = await model.generateContentStream(finalPrompt);

      for await (const chunk of resultStream.stream) {
        const textChunk = chunk.text();
        res.write(`data: ${JSON.stringify({ text: textChunk })}\n\n`);
      }

      res.write(`data: [DONE]\n\n`);
      res.end();
    } catch (error: any) {
      console.error('Orchestration Stream Error:', error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: error?.message || 'Orchestration Error' });
      } else {
        res.write(`data: ${JSON.stringify({ error: error?.message })}\n\n`);
        res.end();
      }
    }
  }
}
