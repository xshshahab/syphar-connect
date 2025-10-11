export const daysAgoFn = (mongoDbTime: string): number => {
  const createdAt = new Date(mongoDbTime);

  if (isNaN(createdAt.getTime())) {
    return 0;
  }
  const currentTime = new Date();
  const timeDifference = currentTime.getTime() - createdAt.getTime();
  const daysAgo = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  return daysAgo >= 0 ? daysAgo : 0;
};
