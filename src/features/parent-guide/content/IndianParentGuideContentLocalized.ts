// Localized content for Parent Guide
export const getLocalizedTopicContent = (topicId: string, ageGroup: string, t: any) => {
  const contentKey = `parentGuide.content.${topicId}.${ageGroup}`;
  return {
    overview: t(`${contentKey}.overview`),
    tips: t(`${contentKey}.tips`, { returnObjects: true }) as string[],
    activities: t(`${contentKey}.activities`, { returnObjects: true }) as string[],
    culturalNotes: t(`${contentKey}.culturalNotes`, { returnObjects: true }) as string[],
    commonChallenges: t(`${contentKey}.commonChallenges`, { returnObjects: true }) as string[],
    solutions: t(`${contentKey}.solutions`, { returnObjects: true }) as string[],
  };
};
