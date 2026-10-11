import type { SignupFormData } from "nfx-ui/schemas";
import type { Control } from "react-hook-form";

import { useFormState, useWatch } from "react-hook-form";

const CODE_LENGTH = 6;

export type SignupProgress = {
  /** Email accepted and the 6-character code entered. */
  verified: boolean;
  /** Password set and confirmed. */
  secured: boolean;
  email: string;
};

/** Live signup progress derived from the form values and their validation state. */
export function useSignupProgress(control: Control<SignupFormData>): SignupProgress {
  const [email, verificationCode, password, confirmPassword] = useWatch({
    control,
    name: ["email", "verificationCode", "password", "confirmPassword"],
  });
  const { errors } = useFormState({ control, name: ["email", "verificationCode", "password", "confirmPassword"] });

  const verified = Boolean(email) && !errors.email && verificationCode.length === CODE_LENGTH && !errors.verificationCode;
  const secured = verified && Boolean(password) && !errors.password && password === confirmPassword && !errors.confirmPassword;

  return { verified, secured, email };
}
