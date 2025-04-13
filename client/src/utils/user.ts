export const getAvatarUrl = (user?: any) => {
  const defaultAvatar = 'https://i.pinimg.com/736x/17/9d/d3/179dd3a922b373d6c01456a69f9b645c.jpg'

  if (!user) return defaultAvatar

  // Check Google picture first
  if (user.picture) return user.picture

  // Then check media avatar
  if (!user.medias?.length) return defaultAvatar

  const avatarMedia = user.medias.find((media: any) => media.mimeType === 'IMAGES' && media.types === 'avatar')

  return avatarMedia?.mediaUrl || defaultAvatar
}
