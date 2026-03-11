import { Image } from 'expo-image';
import { Linking, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useMemo, useState } from 'react';

import { AccessibleButton } from '@/components/accessible-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { US_STATE_NAME_BY_CODE } from '@/constants/us-states';
import type { IndigenousContextData, NpsAddress, NpsPark, NpsParkImage } from '@/types/parks';

const DAY_ORDER = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

type ParkDetailContentProps = {
  park: NpsPark;
  indigenousContext: IndigenousContextData | null;
  isSaved: boolean;
  onToggleSave: () => void;
  showHeroSection?: boolean;
  showSaveButton?: boolean;
};

function getStateNamesFromCodes(codes: string) {
  return codes
    .split(',')
    .map((code) => code.trim().toUpperCase())
    .filter((code) => code.length > 0)
    .map((code) => US_STATE_NAME_BY_CODE[code] ?? code)
    .join(', ');
}

function extractAddressValue(address: NpsAddress) {
  return [address.line1, address.line2, address.line3, `${address.city}, ${address.stateCode} ${address.postalCode}`]
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .join('\n');
}

function LinkText({ url, label }: { url: string; label: string }) {
  return (
    <Pressable onPress={() => Linking.openURL(url)} accessibilityRole="link" accessibilityLabel={label}>
      <ThemedText type="link">{label}</ThemedText>
    </Pressable>
  );
}

function getPrimaryOperatingHours(park: NpsPark) {
  if (park.operatingHours.length === 0) {
    return null;
  }

  const parkName = park.name.toLowerCase();
  const matchingEntry = park.operatingHours.find((item) => item.name.toLowerCase().includes(parkName));
  return matchingEntry ?? park.operatingHours[0];
}

function getPrimaryAddress(park: NpsPark) {
  const physical = park.addresses.find((address) => address.type.toLowerCase() === 'physical');
  return physical ?? park.addresses[0] ?? null;
}

function makeGetInvolvedLinks(park: NpsPark) {
  const links: { label: string; url: string }[] = [];

  if (park.url) {
    links.push({ label: 'National Park website', url: park.url });

    try {
      const volunteerUrl = new URL('getinvolved/volunteer.htm', park.url).toString();
      const donateUrl = new URL('getinvolved/donate.htm', park.url).toString();
      links.push({ label: 'Volunteer with this park', url: volunteerUrl });
      links.push({ label: 'Support/donate for this park', url: donateUrl });
    } catch {
      // Ignore malformed URL issues and keep fallback links.
    }
  }

  if (park.contacts.emailAddresses[0]?.emailAddress) {
    links.push({
      label: 'Email park contact',
      url: `mailto:${park.contacts.emailAddresses[0].emailAddress}`,
    });
  }

  if (park.contacts.phoneNumbers[0]?.phoneNumber) {
    const cleaned = park.contacts.phoneNumbers[0].phoneNumber.replace(/[^0-9+]/g, '');
    if (cleaned) {
      links.push({
        label: 'Call park contact',
        url: `tel:${cleaned}`,
      });
    }
  }

  if (park.directionsUrl) {
    links.push({ label: 'Park directions', url: park.directionsUrl });
  }

  links.push({
    label: 'Volunteer across national parks',
    url: 'https://www.nps.gov/getinvolved/volunteer.htm',
  });
  links.push({
    label: 'Support parks through National Park Foundation',
    url: 'https://www.nationalparks.org/support',
  });

  const unique = new Map<string, string>();
  links.forEach((entry) => {
    if (!unique.has(entry.url)) {
      unique.set(entry.url, entry.label);
    }
  });

  return [...unique.entries()].map(([url, label]) => ({ url, label }));
}

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <ThemedText>No items listed.</ThemedText>;
  }

  return (
    <View style={styles.bulletContainer}>
      {items.map((item, index) => (
        <ThemedText key={`${item}-${index}`}>• {item}</ThemedText>
      ))}
    </View>
  );
}

export function ParkDetailContent({
  park,
  indigenousContext,
  isSaved,
  onToggleSave,
  showHeroSection = true,
  showSaveButton = true,
}: ParkDetailContentProps) {
  const [selectedImage, setSelectedImage] = useState<NpsParkImage | null>(null);

  const stateNames = getStateNamesFromCodes(park.states);
  const primaryImage = park.images[0];
  const visitingHours = getPrimaryOperatingHours(park);
  const primaryAddress = getPrimaryAddress(park);

  const activityNames = useMemo(() => park.activities.map((activity) => activity.name), [park.activities]);
  const topicNames = useMemo(() => park.topics.map((topic) => topic.name), [park.topics]);
  const getInvolvedLinks = useMemo(() => makeGetInvolvedLinks(park), [park]);

  const indigenousNames = indigenousContext?.placeNames ?? [];
  const nameMeanings = indigenousContext?.nameMeanings ?? [];
  const territories = indigenousContext?.territories ?? [];
  const languages = indigenousContext?.languages ?? [];
  const treaties = indigenousContext?.treaties ?? [];

  return (
    <View style={styles.container}>
      {showHeroSection ? (
        <ThemedView style={styles.heroCard}>
          {primaryImage?.url ? (
            <Image
              source={{ uri: primaryImage.url }}
              style={styles.heroImage}
              contentFit="cover"
              accessibilityLabel={primaryImage.altText || park.fullName}
            />
          ) : null}

          <ThemedView style={styles.heroTextBlock}>
            <ThemedText type="title" accessibilityRole="header" style={styles.parkTitle}>
              {park.fullName}
            </ThemedText>
            <ThemedText>{park.designation || 'National Park Service Site'}</ThemedText>
            <ThemedText>{stateNames || park.states}</ThemedText>
          </ThemedView>

          {showSaveButton ? (
            <AccessibleButton
              label={isSaved ? 'Remove From My List' : 'Save This Park To My List'}
              onPress={onToggleSave}
              variant={isSaved ? 'secondary' : 'primary'}
              accessibilityHint="Adds or removes this park from your saved list"
            />
          ) : null}
        </ThemedView>
      ) : null}

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Indigenous Peoples Connected to this Land</ThemedText>
        {indigenousContext?.infoMessage ? <ThemedText>{indigenousContext.infoMessage}</ThemedText> : null}
        {indigenousContext?.keyRequired ? (
          <ThemedText>
            Native Land requires an API key to return records. Add `EXPO_PUBLIC_NATIVE_LAND_API_KEY` to continue.
          </ThemedText>
        ) : null}
        <BulletList items={indigenousNames} />
        {nameMeanings.length > 0 ? (
          <ThemedView style={styles.listItem}>
            <ThemedText type="defaultSemiBold">Name Meanings Provided by the API</ThemedText>
            {nameMeanings.map((entry, index) => (
              <ThemedText key={`${entry.name}-${entry.meaning}-${index}`}>
                • {entry.name}: {entry.meaning}
              </ThemedText>
            ))}
          </ThemedView>
        ) : null}
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Overview</ThemedText>
        <ThemedText>{park.description || 'No overview was provided by the NPS API.'}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Territories in This Area</ThemedText>
        <BulletList items={territories} />
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Languages Connected to This Area</ThemedText>
        <BulletList items={languages} />
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Treaties Connected to This Area</ThemedText>
        <BulletList items={treaties} />
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Activities Listed on the National Park Website for {park.fullName}:</ThemedText>
        <BulletList items={activityNames} />
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Topics Listed by the National Park Service for {park.fullName}:</ThemedText>
        <BulletList items={topicNames} />
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Weather</ThemedText>
        <ThemedText>{park.weatherInfo || 'No weather guidance provided.'}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Visiting the Park</ThemedText>

        {visitingHours ? (
          <ThemedView style={styles.listItem}>
            <ThemedText type="defaultSemiBold">{visitingHours.name}</ThemedText>
            {!!visitingHours.description && <ThemedText>{visitingHours.description}</ThemedText>}
            {DAY_ORDER.map((day) => {
              const dayValue = visitingHours.standardHours?.[day];
              if (!dayValue) {
                return null;
              }
              return (
                <ThemedText key={`${visitingHours.name}-${day}`}>
                  {day[0].toUpperCase() + day.slice(1)}: {dayValue}
                </ThemedText>
              );
            })}
            {visitingHours.exceptions?.length > 0 ? (
              <ThemedView style={styles.exceptionBlock}>
                <ThemedText type="defaultSemiBold">Seasonal / Holiday Exceptions</ThemedText>
                {visitingHours.exceptions.slice(0, 6).map((exception, index) => (
                  <ThemedText key={`${exception.name}-${exception.startDate}-${index}`}>
                    {exception.name}: {exception.startDate} to {exception.endDate}
                  </ThemedText>
                ))}
              </ThemedView>
            ) : null}
          </ThemedView>
        ) : (
          <ThemedText>No operating hours were listed for this park.</ThemedText>
        )}

        <ThemedView style={styles.listItem}>
          <ThemedText type="defaultSemiBold">Park Address</ThemedText>
          {primaryAddress ? (
            <ThemedText>{extractAddressValue(primaryAddress)}</ThemedText>
          ) : (
            <ThemedText>No park address was listed.</ThemedText>
          )}
        </ThemedView>

        <ThemedView style={styles.listItem}>
          <ThemedText type="defaultSemiBold">Park Contact Information</ThemedText>
          {park.contacts.phoneNumbers.length === 0 ? (
            <ThemedText>No phone numbers listed.</ThemedText>
          ) : (
            park.contacts.phoneNumbers.map((phone, index) => (
              <ThemedText key={`${phone.phoneNumber}-${index}`}>
                {phone.type || 'Phone'}: {phone.phoneNumber}
                {phone.extension ? ` ext. ${phone.extension}` : ''}
              </ThemedText>
            ))
          )}
          {park.contacts.emailAddresses.length === 0 ? (
            <ThemedText>No email addresses listed.</ThemedText>
          ) : (
            park.contacts.emailAddresses.map((email, index) => (
              <ThemedText key={`${email.emailAddress}-${index}`}>{email.emailAddress}</ThemedText>
            ))
          )}
          {!!park.directionsInfo && <ThemedText>{park.directionsInfo}</ThemedText>}
          {!!park.url && <LinkText url={park.url} label="Open official park website" />}
          {!!park.directionsUrl && <LinkText url={park.directionsUrl} label="Open park directions" />}
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Entrance Fees</ThemedText>
        {park.entranceFees.length === 0 ? (
          <ThemedText>No entrance fee data listed for this park.</ThemedText>
        ) : (
          park.entranceFees.map((fee, index) => (
            <ThemedView key={`${fee.title}-${fee.cost}-${index}`} style={styles.listItem}>
              <ThemedText type="defaultSemiBold">{fee.title || 'Untitled fee'}</ThemedText>
              <ThemedText>{fee.cost ? `$${fee.cost}` : 'No cost listed'}</ThemedText>
              {!!fee.description && <ThemedText>{fee.description}</ThemedText>}
            </ThemedView>
          ))
        )}
      </ThemedView>

      {park.entrancePasses.length > 0 ? (
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Entrance Passes</ThemedText>
          {park.entrancePasses.map((pass, index) => (
            <ThemedView key={`${pass.title}-${pass.cost}-${index}`} style={styles.listItem}>
              <ThemedText type="defaultSemiBold">{pass.title || 'Untitled pass'}</ThemedText>
              <ThemedText>{pass.cost ? `$${pass.cost}` : 'No cost listed'}</ThemedText>
              {!!pass.description && <ThemedText>{pass.description}</ThemedText>}
            </ThemedView>
          ))}
        </ThemedView>
      ) : null}

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Image Gallery</ThemedText>
        {park.images.length === 0 ? (
          <ThemedText>No images provided by NPS for this park.</ThemedText>
        ) : (
          park.images.slice(0, 10).map((image, index) => (
            <Pressable
              key={`${image.url}-${index}`}
              onPress={() => setSelectedImage(image)}
              accessibilityRole="button"
              accessibilityLabel={`Open larger photo ${image.title || index + 1}`}>
              <ThemedView style={styles.imageCard}>
                <Image
                  source={{ uri: image.url }}
                  style={styles.galleryImage}
                  contentFit="cover"
                  accessibilityLabel={image.altText || image.title || 'Park photo'}
                />
                <ThemedView style={styles.imageMeta}>
                  <ThemedText type="defaultSemiBold">{image.title || `Photo ${index + 1}`}</ThemedText>
                  {!!image.caption && <ThemedText>{image.caption}</ThemedText>}
                  {!!image.credit && <ThemedText>Credit: {image.credit}</ThemedText>}
                </ThemedView>
              </ThemedView>
            </Pressable>
          ))
        )}
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Get Involved and Defend this Park</ThemedText>
        <ThemedText>
          National parks are protected so that future generations can experience these landscapes,
          wildlife, and stories. Protecting these places is a shared responsibility. By learning about
          the land, respecting the communities connected to it, and supporting conservation efforts,
          visitors can help ensure that parks remain healthy and accessible for years to come.
        </ThemedText>
        <ThemedText>
          There are many ways to get involved. You can volunteer with park programs, support
          organizations that help protect public lands, participate in stewardship projects, or simply
          practice responsible recreation when visiting. Even small actions, like staying on trails,
          respecting wildlife, and packing out trash, make a real difference.
        </ThemedText>
        <ThemedText>
          Explore the resources below to learn how you can help protect and support this park.
        </ThemedText>

        {getInvolvedLinks.map((link, index) => (
          <LinkText key={`${link.url}-${index}`} url={link.url} label={link.label} />
        ))}
      </ThemedView>

      <Modal
        visible={Boolean(selectedImage)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Pressable onPress={() => setSelectedImage(null)} style={styles.closeButton}>
              <ThemedText type="defaultSemiBold">X</ThemedText>
            </Pressable>
            {selectedImage ? (
              <>
                <Image
                  source={{ uri: selectedImage.url }}
                  style={styles.modalImage}
                  contentFit="contain"
                  accessibilityLabel={selectedImage.altText || selectedImage.title || 'Expanded park photo'}
                />
                <ThemedText type="defaultSemiBold">{selectedImage.title || 'Park image'}</ThemedText>
                {!!selectedImage.caption && <ThemedText>{selectedImage.caption}</ThemedText>}
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingBottom: 24,
  },
  heroCard: {
    borderRadius: 14,
    overflow: 'hidden',
    padding: 12,
    gap: 12,
  },
  heroImage: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    backgroundColor: '#dde4ea',
  },
  heroTextBlock: {
    gap: 6,
  },
  parkTitle: {
    fontSize: 28,
    lineHeight: 34,
  },
  section: {
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  listItem: {
    borderRadius: 10,
    padding: 10,
    gap: 6,
  },
  exceptionBlock: {
    borderRadius: 8,
    padding: 8,
    gap: 4,
  },
  bulletContainer: {
    gap: 6,
  },
  imageCard: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#9aa6b2',
    marginBottom: 10,
  },
  galleryImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#dde4ea',
  },
  imageMeta: {
    padding: 10,
    gap: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  modalCard: {
    width: '100%',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    backgroundColor: '#111',
  },
  modalImage: {
    width: '100%',
    height: 380,
    backgroundColor: '#000',
  },
  closeButton: {
    alignSelf: 'flex-end',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#ffffff',
  },
});
