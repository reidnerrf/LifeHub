import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CollaborationIndicatorProps {
  onlineUsers: { id: string; name?: string }[];
  isLocked?: boolean;
  lockOwner?: string;
}

export const CollaborationIndicator: React.FC<CollaborationIndicatorProps> = ({ onlineUsers, isLocked, lockOwner }) => {
  return (
    <View style={styles.container}>
      <View style={styles.presence}>
        {onlineUsers.slice(0, 5).map(u => (
          <View key={u.id} style={styles.avatar}><Text style={styles.avatarText}>{(u.name || u.id)[0]?.toUpperCase()}</Text></View>
        ))}
        {onlineUsers.length > 5 && <Text style={styles.more}>+{onlineUsers.length - 5}</Text>}
      </View>
      {isLocked && (
        <Text style={styles.lock}>Bloqueado por {lockOwner || 'outro usuário'}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  presence: { flexDirection: 'row' },
  avatar: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#DDE7FF', alignItems: 'center', justifyContent: 'center', marginRight: -6, borderWidth: 2, borderColor: '#fff' },
  avatarText: { fontSize: 11, fontWeight: '700', color: '#2d5bd1' },
  more: { marginLeft: 8, color: '#666' },
  lock: { color: '#b00020', fontWeight: '600' },
});

