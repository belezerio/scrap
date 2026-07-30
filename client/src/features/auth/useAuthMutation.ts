import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { LoginFormValues, RegisterFormValues } from '../../schemas/auth.schema';
import { ApiResponse, User } from '../../types';

interface AuthResponseData {
  user: User;
  token: string;
}

export const useLoginMutation = () => {
  const { login } = useAuth();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: async (data: LoginFormValues) => {
      const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/login', data);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.data) {
        login(data.data.token, data.data.user);
        success('Welcome back!', 'Authentication Successful');
      }
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      error(msg, 'Authentication Error');
    },
  });
};

export const useRegisterMutation = () => {
  const { login } = useAuth();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: async (data: RegisterFormValues) => {
      const { confirmPassword: _, ...payload } = data;
      const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/register', payload);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.data) {
        login(data.data.token, data.data.user);
        success('Account created successfully!', 'Registration Complete');
      }
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      error(msg, 'Registration Error');
    },
  });
};
