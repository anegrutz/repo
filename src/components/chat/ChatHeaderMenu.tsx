import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { REPORT_REASONS, type ReportReason } from '@/features/moderation/helpers';

type Action = 'report' | 'unmatch';

type Props = {
  reportLabels: Record<ReportReason, string>;
  triggerLabel: string;
  reportLabel: string;
  unmatchLabel: string;
  cancelLabel: string;
  unmatchConfirmTitle: string;
  unmatchConfirmBody: string;
  onAction: (action: Action, reason?: ReportReason) => Promise<void>;
};

export function ChatHeaderMenu({
  reportLabels,
  triggerLabel,
  reportLabel,
  unmatchLabel,
  cancelLabel,
  unmatchConfirmTitle,
  unmatchConfirmBody,
  onAction,
}: Props) {
  const [open, setOpen] = useState(false);
  const [showReasons, setShowReasons] = useState(false);
  const [confirmingUnmatch, setConfirmingUnmatch] = useState(false);

  const close = () => {
    setOpen(false);
    setShowReasons(false);
    setConfirmingUnmatch(false);
  };

  const onPickReason = async (reason: ReportReason) => {
    close();
    await onAction('report', reason);
  };

  const onConfirmUnmatch = async () => {
    close();
    await onAction('unmatch');
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={triggerLabel}
        className="px-3 py-2"
      >
        <Text className="text-leaf-400 text-xl">⋯</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <Pressable className="flex-1 bg-black/50" onPress={close}>
          <View className="absolute inset-x-4 bottom-12 rounded-2xl bg-bg-elevated p-2">
            {!showReasons && !confirmingUnmatch ? (
              <>
                <MenuItem
                  label={reportLabel}
                  onPress={() => setShowReasons(true)}
                  destructive
                />
                <MenuItem
                  label={unmatchLabel}
                  onPress={() => setConfirmingUnmatch(true)}
                  destructive
                />
                <MenuItem label={cancelLabel} onPress={close} />
              </>
            ) : null}

            {showReasons ? (
              <View>
                {REPORT_REASONS.map((r) => (
                  <MenuItem key={r} label={reportLabels[r]} onPress={() => onPickReason(r)} />
                ))}
                <MenuItem label={cancelLabel} onPress={close} />
              </View>
            ) : null}

            {confirmingUnmatch ? (
              <View className="p-3">
                <Text className="text-leaf-400 text-base font-semibold">
                  {unmatchConfirmTitle}
                </Text>
                <Text className="text-haze-200 mt-2 text-sm">{unmatchConfirmBody}</Text>
                <View className="mt-4 flex-row justify-end gap-3">
                  <Pressable
                    onPress={close}
                    accessibilityRole="button"
                    className="border-haze-600 rounded-xl border px-4 py-2"
                  >
                    <Text className="text-haze-200">{cancelLabel}</Text>
                  </Pressable>
                  <Pressable
                    onPress={onConfirmUnmatch}
                    accessibilityRole="button"
                    className="bg-ember-500 rounded-xl px-4 py-2"
                  >
                    <Text className="text-bg font-semibold">{unmatchLabel}</Text>
                  </Pressable>
                </View>
              </View>
            ) : null}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

function MenuItem({
  label,
  onPress,
  destructive,
}: {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="border-haze-600 border-b px-4 py-3 last:border-b-0"
    >
      <Text className={destructive ? 'text-ember-500' : 'text-haze-200'}>{label}</Text>
    </Pressable>
  );
}
