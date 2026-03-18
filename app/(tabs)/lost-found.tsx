import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Camera, PackageSearch, Plus, ShieldAlert } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryChip } from '@/components/CategoryChip';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SectionHeader } from '@/components/SectionHeader';
import { StateCard } from '@/components/StateCard';
import { theme } from '@/constants/theme';
import { useBuildings, useLostAndFound } from '@/hooks/useCampusData';
import { submitLostAndFoundReport } from '@/services/campus-service';
import { LostItemReport } from '@/types/domain';

const fallbackImage =
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80';

export default function LostAndFoundScreen() {
  const queryClient = useQueryClient();
  const { reports, isLoading } = useLostAndFound();
  const { buildings } = useBuildings();
  const [isComposerVisible, setIsComposerVisible] = useState<boolean>(false);
  const [status, setStatus] = useState<'lost' | 'found'>('lost');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | undefined>(undefined);
  const [selectedImageUri, setSelectedImageUri] = useState<string | undefined>(undefined);

  const selectedBuilding = useMemo(
    () => buildings.find((item) => item.id === selectedBuildingId),
    [buildings, selectedBuildingId],
  );

  const reportMutation = useMutation({
    mutationFn: async () => {
      const payload: LostItemReport = {
        id: `report-${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        status,
        locationName: selectedBuilding?.name ?? 'Campus location',
        imageUrl: selectedImageUri ?? fallbackImage,
        reportedAt: 'Just now',
        contactHint: 'Open the app to follow up with campus support',
        buildingId: selectedBuilding?.id,
      };

      return submitLostAndFoundReport(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['campus-data'] });
      setTitle('');
      setDescription('');
      setSelectedBuildingId(undefined);
      setSelectedImageUri(undefined);
      setIsComposerVisible(false);
    },
  });

  const pickImage = async (): Promise<void> => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedImageUri(result.assets[0]?.uri);
    }
  };

  const canSubmit = title.trim().length > 2 && description.trim().length > 6;

  return (
    <SafeAreaView style={styles.container} testID="lost-found-screen">
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <View style={styles.header}>
              <Text style={styles.eyebrow}>Community care</Text>
              <Text style={styles.title}>Lost & Found</Text>
              <Text style={styles.subtitle}>Help classmates recover valuables with place-aware reports and visual context.</Text>
            </View>

            <View style={styles.composerToggle}>
              <SectionHeader title="Recent reports" subtitle="Campus activity updated locally for offline access" />
              <Pressable onPress={() => setIsComposerVisible((current) => !current)} style={styles.plusButton} testID="toggle-report-composer-button">
                <Plus color="#FFFFFF" size={18} />
              </Pressable>
            </View>

            {isComposerVisible ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.composerCard}>
                <View style={styles.formWrap}>
                  <Text style={styles.formTitle}>Post a report</Text>
                  <View style={styles.statusRow}>
                    <CategoryChip label="Lost" category="facility" isActive={status === 'lost'} onPress={() => setStatus('lost')} />
                    <CategoryChip label="Found" category="faculty" isActive={status === 'found'} onPress={() => setStatus('found')} />
                  </View>
                  <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Item name"
                    placeholderTextColor={theme.colors.textMuted}
                    style={styles.input}
                    testID="lost-found-title-input"
                  />
                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Describe where or how it was seen"
                    placeholderTextColor={theme.colors.textMuted}
                    multiline
                    style={[styles.input, styles.multilineInput]}
                    testID="lost-found-description-input"
                  />

                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.buildingRow}>
                    {buildings.map((building) => (
                      <Pressable
                        key={building.id}
                        onPress={() => setSelectedBuildingId(building.id)}
                        style={[
                          styles.buildingPill,
                          selectedBuildingId === building.id ? styles.buildingPillActive : undefined,
                        ]}
                        testID={`report-building-${building.id}`}
                      >
                        <Text
                          style={[
                            styles.buildingPillText,
                            selectedBuildingId === building.id ? styles.buildingPillTextActive : undefined,
                          ]}
                        >
                          {building.code}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>

                  <Pressable style={styles.imagePicker} onPress={() => void pickImage()} testID="pick-report-image-button">
                    <Camera color={theme.colors.primary} size={18} />
                    <Text style={styles.imagePickerText}>{selectedImageUri ? 'Photo selected' : 'Add photo'}</Text>
                  </Pressable>

                  <PrimaryButton
                    label={status === 'lost' ? 'Report lost item' : 'Report found item'}
                    onPress={() => reportMutation.mutate()}
                    isLoading={reportMutation.isPending}
                    testID="submit-report-button"
                  />
                  {!canSubmit ? (
                    <Text style={styles.helperText}>Add a clear title and description before posting.</Text>
                  ) : null}
                </View>
              </ScrollView>
            ) : null}
          </View>
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.reportCard} testID={`lost-found-report-${item.id}`}>
            <Image source={{ uri: item.imageUrl }} style={styles.reportImage} contentFit="cover" />
            <View style={styles.reportContent}>
              <View style={styles.badgeRow}>
                <View style={[styles.statusBadge, item.status === 'lost' ? styles.lostBadge : styles.foundBadge]}>
                  {item.status === 'lost' ? <ShieldAlert color="#FFFFFF" size={14} /> : <PackageSearch color="#FFFFFF" size={14} />}
                  <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
                <Text style={styles.reportTime}>{item.reportedAt}</Text>
              </View>
              <Text style={styles.reportTitle}>{item.title}</Text>
              <Text style={styles.reportDescription}>{item.description}</Text>
              <Text style={styles.reportLocation}>{item.locationName}</Text>
              <Text style={styles.reportHint}>{item.contactHint}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          isLoading ? (
            <StateCard title="Loading reports" description="Gathering recent campus submissions." loading />
          ) : (
            <StateCard title="Nothing reported yet" description="When students log an item, it will appear here." />
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 14,
  },
  headerWrap: {
    paddingTop: 12,
    paddingBottom: 20,
    gap: 16,
  },
  header: {
    gap: 6,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  title: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: '900',
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  composerToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  plusButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  composerCard: {
    paddingRight: 20,
  },
  formWrap: {
    width: 320,
    gap: 12,
    borderRadius: 28,
    backgroundColor: theme.colors.surface,
    padding: 18,
    ...theme.shadow,
  },
  formTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: theme.colors.text,
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  buildingRow: {
    paddingVertical: 2,
  },
  buildingPill: {
    marginRight: 10,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buildingPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  buildingPillText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '800',
  },
  buildingPillTextActive: {
    color: '#FFFFFF',
  },
  imagePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  imagePickerText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  helperText: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  reportCard: {
    flexDirection: 'row',
    gap: 14,
    borderRadius: 26,
    backgroundColor: theme.colors.surface,
    padding: 12,
    ...theme.shadow,
  },
  reportImage: {
    width: 108,
    height: 124,
    borderRadius: 18,
  },
  reportContent: {
    flex: 1,
    gap: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  lostBadge: {
    backgroundColor: theme.colors.danger,
  },
  foundBadge: {
    backgroundColor: theme.colors.success,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  reportTime: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  reportTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  reportDescription: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  reportLocation: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  reportHint: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
});
