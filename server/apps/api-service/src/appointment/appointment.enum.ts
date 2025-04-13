export enum AppointmentStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Completed = 'completed',
  Cancelled = 'cancelled',
  NoShow = 'no_show'
}

export enum AppointmentType {
  IN_PERSON = 'in_person',
  VIDEO_CALL = 'video_call'
}

export enum VideoProvider {
  ZEGOCLOUD = 'zegocloud',
  ZOOM = 'zoom',
  GOOGLE_MEET = 'google_meet',
  CUSTOM = 'custom'
}
