import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function createIcon(name: IoniconName): React.ComponentType<any> {
  return ({ size = 24, color = '#172033', strokeWidth: _strokeWidth, ...props }: any) => (
    <Ionicons name={name} size={size} color={color} {...props} />
  );
}

export const AlertTriangle = createIcon('warning-outline');
export const ArrowRight = createIcon('arrow-forward-outline');
export const Camera = createIcon('camera-outline');
export const CheckCircle = createIcon('checkmark-circle-outline');
export const ChevronDown = createIcon('chevron-down-outline');
export const ChevronLeft = createIcon('chevron-back-outline');
export const Clock = createIcon('time-outline');
export const Eye = createIcon('eye-outline');
export const FileVideo = createIcon('videocam-outline');
export const Heart = createIcon('heart-outline');
export const HelpCircle = createIcon('help-circle-outline');
export const ImageIcon = createIcon('image-outline');
export const LogOut = createIcon('log-out-outline');
export const Mail = createIcon('mail-outline');
export const Menu = createIcon('menu-outline');
export const Search = createIcon('search-outline');
export const Send = createIcon('send-outline');
export const Settings = createIcon('settings-outline');
export const Share2 = createIcon('share-social-outline');
export const Sparkles = createIcon('sparkles-outline');
export const Trash2 = createIcon('trash-outline');
export const Upload = createIcon('cloud-upload-outline');
export const Volume2 = createIcon('volume-high-outline');
export const User = createIcon('person-outline');
export const UserPlus = createIcon('person-add-outline');

