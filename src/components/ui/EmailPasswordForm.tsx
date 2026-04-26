import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type EmailPasswordValues = z.infer<typeof schema>;

type Props = {
  emailLabel: string;
  passwordLabel: string;
  submitLabel: string;
  invalidEmailLabel: string;
  weakPasswordLabel: string;
  errorMessage?: string | null;
  onSubmit: (values: EmailPasswordValues) => Promise<void>;
};

export function EmailPasswordForm(props: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailPasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });
  const [busy, setBusy] = useState(false);

  const submit = handleSubmit(async (values) => {
    setBusy(true);
    try {
      await props.onSubmit(values);
    } finally {
      setBusy(false);
    }
  });

  return (
    <View className="w-full">
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value, onBlur } }) => (
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder={props.emailLabel}
            placeholderTextColor="#8a8a8a"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            className="border-haze-600 text-haze-200 rounded-2xl border bg-bg-elevated px-4 py-3"
          />
        )}
      />
      {errors.email ? (
        <Text className="mt-1 text-sm text-ember-500">{props.invalidEmailLabel}</Text>
      ) : null}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value, onBlur } }) => (
          <TextInput
            autoCapitalize="none"
            autoComplete="password"
            secureTextEntry
            placeholder={props.passwordLabel}
            placeholderTextColor="#8a8a8a"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            className="border-haze-600 text-haze-200 mt-3 rounded-2xl border bg-bg-elevated px-4 py-3"
          />
        )}
      />
      {errors.password ? (
        <Text className="mt-1 text-sm text-ember-500">{props.weakPasswordLabel}</Text>
      ) : null}

      {props.errorMessage ? (
        <Text className="mt-3 text-sm text-ember-500">{props.errorMessage}</Text>
      ) : null}

      <Pressable
        className="mt-6 items-center rounded-2xl bg-leaf-500 py-4"
        accessibilityRole="button"
        disabled={busy}
        onPress={submit}
      >
        {busy ? (
          <ActivityIndicator color="#0b0f0a" />
        ) : (
          <Text className="text-bg text-base font-semibold">{props.submitLabel}</Text>
        )}
      </Pressable>
    </View>
  );
}
