"use client";

import { useEffect, useRef } from "react";
import { usePaystackPayment } from "react-paystack";

interface PaystackIntegrationProps {
  config: any;
  onSuccess: () => void;
  onClose: () => void;
  trigger: boolean;
}

export default function PaystackIntegration({ config, onSuccess, onClose, trigger }: PaystackIntegrationProps) {
  const initializePayment = usePaystackPayment(config);
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (trigger && !hasTriggered.current) {
      hasTriggered.current = true;
      initializePayment({ onSuccess, onClose });
    }
    // Reset trigger if it goes false so it can be re-triggered later
    if (!trigger) {
      hasTriggered.current = false;
    }
  }, [trigger, initializePayment, onSuccess, onClose]);

  return null;
}
