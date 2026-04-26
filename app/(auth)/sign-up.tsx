import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { EmailPasswordForm } from '@/components/ui/EmailPasswordForm';
import { AuthApiError, signUpWithEmail } from '@/features/auth/api';

export default function SignUp() {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: { email: string; password: string }) => {
    setError(null);
    try {
      await signUpWithEmail(values.email, values.password);
      router.replace('/(auth)/age-gate');
    } catch (e) {
      const code = e instanceof AuthApiError ? e.code : 'generic';
      const key =
        code === 'invalid-email'
          ? 'auth.signIn.errors.invalidEmail'
          : code === 'weak-password'
            ? 'auth.signIn.errors.weakPassword'
            : code === 'wrong-credentials' || code === 'email-in-use'
              ? 'auth.signIn.errors.wrongCredentials'
              : 'auth.signIn.errors.generic';
      setError(t(key));
    }
  };

  return (
    <View className="flex-1 justify-center bg-bg px-6">
      <Text className="text-leaf-400 text-3xl font-bold">{t('auth.signUp.title')}</Text>
      <Text className="text-haze-200 mt-2 text-base">{t('auth.signUp.subtitle')}</Text>

      <View className="mt-8">
        <EmailPasswordForm
          emailLabel={t('auth.signUp.email')}
          passwordLabel={t('auth.signUp.password')}
          submitLabel={t('auth.signUp.submit')}
          invalidEmailLabel={t('auth.signIn.errors.invalidEmail')}
          weakPasswordLabel={t('auth.signIn.errors.weakPassword')}
          errorMessage={error}
          onSubmit={handleSubmit}
        />
      </View>

      <Text className="text-haze-400 mt-6 text-center text-xs">
        {t('auth.signUp.agreement')}
      </Text>

      <Pressable className="mt-6" accessibilityRole="link">
        <Link href="/(auth)/sign-in" className="text-leaf-400 text-center text-sm">
          {t('auth.signUp.switchToSignIn')}
        </Link>
      </Pressable>
    </View>
  );
}
