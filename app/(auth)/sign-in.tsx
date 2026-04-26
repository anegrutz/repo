import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { EmailPasswordForm } from '@/components/ui/EmailPasswordForm';
import { AuthApiError, signInWithEmail } from '@/features/auth/api';

export default function SignIn() {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: { email: string; password: string }) => {
    setError(null);
    try {
      await signInWithEmail(values.email, values.password);
    } catch (e) {
      const code = e instanceof AuthApiError ? e.code : 'generic';
      const key =
        code === 'invalid-email'
          ? 'auth.signIn.errors.invalidEmail'
          : code === 'weak-password'
            ? 'auth.signIn.errors.weakPassword'
            : code === 'wrong-credentials'
              ? 'auth.signIn.errors.wrongCredentials'
              : 'auth.signIn.errors.generic';
      setError(t(key));
    }
  };

  return (
    <View className="flex-1 justify-center bg-bg px-6">
      <Text className="text-leaf-400 text-3xl font-bold">{t('auth.signIn.title')}</Text>
      <Text className="text-haze-200 mt-2 text-base">{t('auth.signIn.subtitle')}</Text>

      <View className="mt-8">
        <EmailPasswordForm
          emailLabel={t('auth.signIn.email')}
          passwordLabel={t('auth.signIn.password')}
          submitLabel={t('auth.signIn.submit')}
          invalidEmailLabel={t('auth.signIn.errors.invalidEmail')}
          weakPasswordLabel={t('auth.signIn.errors.weakPassword')}
          errorMessage={error}
          onSubmit={handleSubmit}
        />
      </View>

      <Pressable className="mt-6" accessibilityRole="link">
        <Link href="/(auth)/sign-up" className="text-leaf-400 text-center text-sm">
          {t('auth.signIn.switchToSignUp')}
        </Link>
      </Pressable>
    </View>
  );
}
