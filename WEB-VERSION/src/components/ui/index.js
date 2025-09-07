// Core UI Components
export { default as Avatar } from './Avatar';
export { default as Button } from './Button';
export { default as Input } from './Input';
export { default as Modal, ConfirmModal, Drawer } from './Modal';

// Loading Components
export {
  LoadingSpinner,
  LoadingDots,
  LoadingWave,
  TypingIndicator,
  FullScreenLoading,
  InlineLoading,
  PageLoading,
  ChatLoading,
  ButtonLoading,
  SkeletonLine,
  SkeletonAvatar,
  SkeletonMessage,
  SkeletonChatList,
  default as Loading,
} from './Loading';

// Export types for TypeScript users
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'text';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type InputSize = 'sm' | 'md' | 'lg';
export type ModalWidth = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full';
export type LoadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom'; 