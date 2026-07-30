import React, { createContext, useState, useCallback } from 'react';
import { ModalConfig } from '../types';
import { Modal } from '../components/ui/Modal';

interface ModalContextType {
  openModal: (config: ModalConfig) => void;
  closeModal: () => void;
}

export const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);

  const openModal = useCallback((config: ModalConfig) => {
    setModalConfig(config);
  }, []);

  const closeModal = useCallback(() => {
    setModalConfig(null);
  }, []);

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {modalConfig && (
        <Modal
          isOpen={!!modalConfig}
          onClose={closeModal}
          title={modalConfig.title}
          footer={modalConfig.footer}
          size={modalConfig.size}
        >
          {modalConfig.content}
        </Modal>
      )}
    </ModalContext.Provider>
  );
};
