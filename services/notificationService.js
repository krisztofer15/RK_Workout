import { supabase } from '../lib/supabase';

// Új értesítés létrehozása
export const createNotification = async (userId, title, message) => {
  if (!userId || !title || !message) {
    return { success: false, msg: 'Invalid notification data' };
  }

  const { error } = await supabase
    .from('notifications')
    .insert([{ user_id: userId, title, message, is_read: false }]);

  if (error) {
    console.error('Error creating notification:', error.message);
    return { success: false, msg: error.message };
  }

  return { success: true, msg: 'Notification created successfully' };
};

// Egy értesítés törlése
export const deleteNotification = async (notificationId) => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) {
    console.error('Error deleting notification:', error.message);
    return { success: false, msg: error.message };
  }

  return { success: true, msg: 'Notification deleted successfully' };
};

// Összes értesítés törlése adott user_id alapján
export const deleteAllNotifications = async (userId) => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting all notifications:', error.message);
    return { success: false, msg: error.message };
  }

  return { success: true, msg: 'All notifications deleted successfully' };
};

// Egy értesítés megjelölése olvasottként
export const markAsRead = async (notificationId) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error.message);
    return { success: false, msg: error.message };
  }

  return { success: true, msg: 'Notification marked as read' };
};

// Összes értesítés megjelölése olvasottként
export const markAllAsRead = async (userId) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId);

  if (error) {
    console.error('Error marking all notifications as read:', error.message);
    return { success: false, msg: error.message };
  }

  return { success: true, msg: 'All notifications marked as read' };
};
