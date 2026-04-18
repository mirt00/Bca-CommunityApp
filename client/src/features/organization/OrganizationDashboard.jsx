import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
  TextInput,
  Image,
  ScrollView,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import {
  getOrganizationUsers,
  approveUser,
  rejectUser,
  getOrganizationGroups,
  createOrganizationGroup,
  updateOrganizationGroup,
  deleteOrganizationGroup,
} from '../../api/endpoints/auth';

const TabButton = ({ label, active, onPress }) => (
  <TouchableOpacity style={[styles.tabButton, active && styles.tabButtonActive]} onPress={onPress}>
    <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const UserCard = ({ user, onApprove, onDelete }) => (
  <View style={styles.card}>
    <View style={styles.cardContent}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.fullName?.charAt(0) || 'U'}</Text>
        </View>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.cardTitle}>{user.fullName || 'Unknown User'}</Text>
        <Text style={styles.cardSubtitle}>{user.email}</Text>
        {user.batch && <Text style={styles.cardMeta}>Batch: {user.batch}</Text>}
        {user.faculty && <Text style={styles.cardMeta}>Faculty: {user.faculty}</Text>}
        <View style={[styles.badge, user.isApproved ? styles.badgeApproved : styles.badgePending]}>
          <Text style={styles.badgeText}>{user.isApproved ? 'Approved' : 'Pending'}</Text>
        </View>
      </View>
    </View>
    <View style={styles.cardActions}>
      {!user.isApproved && (
        <TouchableOpacity style={styles.approveButton} onPress={() => onApprove(user._id)}>
          <Text style={styles.approveButtonText}>Approve</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(user._id)}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const GroupCard = ({ group, onEdit, onDelete }) => (
  <View style={styles.card}>
    <View style={styles.cardContent}>
      {group.image ? (
        <Image source={{ uri: group.image }} style={styles.groupImage} />
      ) : (
        <View style={styles.groupImagePlaceholder}>
          <Text style={styles.groupImagePlaceholderText}>{group.name?.charAt(0) || 'G'}</Text>
        </View>
      )}
      <View style={styles.groupInfo}>
        <Text style={styles.cardTitle}>{group.name}</Text>
        {group.description && <Text style={styles.cardDescription} numberOfLines={2}>{group.description}</Text>}
        <Text style={styles.cardMeta}>{group.members?.length || 0} members</Text>
      </View>
    </View>
    <View style={styles.cardActions}>
      <TouchableOpacity style={styles.editButton} onPress={() => onEdit(group)}>
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(group._id)}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function OrganizationDashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('users');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.orgBadge}>
            <Text style={styles.orgBadgeText}>{user?.organizationName?.charAt(0) || 'O'}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{user?.organizationName || 'Organization'}</Text>
            <Text style={styles.headerSubtitle}>Admin Dashboard</Text>
          </View>
        </View>
        <Text style={styles.headerDate}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
      </View>

      <View style={styles.tabs}>
        <TabButton label="Users" active={activeTab === 'users'} onPress={() => setActiveTab('users')} />
        <TabButton label="Groups" active={activeTab === 'groups'} onPress={() => setActiveTab('groups')} />
        <TabButton label="Files" active={activeTab === 'files'} onPress={() => setActiveTab('files')} />
      </View>

      <View style={styles.content}>
        {activeTab === 'users' && <UsersTab onRefresh={onRefresh} />}
        {activeTab === 'groups' && <GroupsTab onRefresh={onRefresh} />}
        {activeTab === 'files' && <FilesTab />}
      </View>
    </SafeAreaView>
  );
}

function UsersTab({ onRefresh }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data } = await getOrganizationUsers();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await approveUser(userId);
      setUsers(users.map(u => u._id === userId ? { ...u, isApproved: true } : u));
      Alert.alert('Success', 'User approved successfully');
    } catch (err) {
      Alert.alert('Error', 'Failed to approve user');
    }
  };

  const handleDelete = (userId) => {
    Alert.alert('Delete User', 'Are you sure you want to delete this user?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await rejectUser(userId);
          setUsers(users.filter(u => u._id !== userId));
          Alert.alert('Success', 'User deleted successfully');
        } catch (err) {
          Alert.alert('Error', 'Failed to delete user');
        }
      }},
    ]);
  };

  const pendingCount = users.filter(u => !u.isApproved).length;

  return (
    <View style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Text style={styles.tabTitle}>All Users ({users.length})</Text>
        {pendingCount > 0 && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>{pendingCount} pending</Text>
          </View>
        )}
      </View>
      <FlatList
        data={users}
        renderItem={({ item }) => <UserCard user={item} onApprove={handleApprove} onDelete={handleDelete} />}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
        ListEmptyComponent={!loading ? <Text style={styles.emptyText}>No users found</Text> : null}
        contentContainerStyle={users.length === 0 ? styles.emptyContainer : null}
      />
    </View>
  );
}

function GroupsTab({ onRefresh }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', image: '' });

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const { data } = await getOrganizationGroups();
      setGroups(data.groups || []);
    } catch (err) {
      console.error('Failed to load groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Group name is required');
      return;
    }

    try {
      if (editingGroup) {
        await updateOrganizationGroup(editingGroup._id, formData);
        Alert.alert('Success', 'Group updated successfully');
      } else {
        await createOrganizationGroup(formData);
        Alert.alert('Success', 'Group created successfully');
      }
      setModalVisible(false);
      setEditingGroup(null);
      setFormData({ name: '', description: '', image: '' });
      loadGroups();
    } catch (err) {
      Alert.alert('Error', editingGroup ? 'Failed to update group' : 'Failed to create group');
    }
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setFormData({ name: group.name, description: group.description || '', image: group.image || '' });
    setModalVisible(true);
  };

  const handleDelete = (groupId) => {
    Alert.alert('Delete Group', 'Are you sure you want to delete this group?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteOrganizationGroup(groupId);
          setGroups(groups.filter(g => g._id !== groupId));
          Alert.alert('Success', 'Group deleted successfully');
        } catch (err) {
          Alert.alert('Error', 'Failed to delete group');
        }
      }},
    ]);
  };

  return (
    <View style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Text style={styles.tabTitle}>All Groups ({groups.length})</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => { setEditingGroup(null); setFormData({ name: '', description: '', image: '' }); setModalVisible(true); }}>
          <Text style={styles.addButtonText}>+ Create</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={groups}
        renderItem={({ item }) => <GroupCard group={item} onEdit={handleEdit} onDelete={handleDelete} />}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
        ListEmptyComponent={!loading ? <Text style={styles.emptyText}>No groups created yet</Text> : null}
        contentContainerStyle={groups.length === 0 ? styles.emptyContainer : null}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingGroup ? 'Edit Group' : 'Create New Group'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Group Name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={3}
            />
            <TextInput
              style={styles.input}
              placeholder="Image URL (optional)"
              value={formData.image}
              onChangeText={(text) => setFormData({ ...formData, image: text })}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => { setModalVisible(false); setEditingGroup(null); }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>{editingGroup ? 'Update' : 'Create'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function FilesTab() {
  return (
    <View style={styles.tabContent}>
      <Text style={styles.emptyText}>File management coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#1e293b', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 },
  headerContent: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  orgBadge: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  orgBadgeText: { fontSize: 20, fontWeight: '700', color: '#fff' },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: '#94a3b8', marginTop: 2 },
  headerDate: { fontSize: 12, color: '#64748b' },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, marginHorizontal: 4 },
  tabButtonActive: { backgroundColor: '#eff6ff' },
  tabButtonText: { fontSize: 14, fontWeight: '500', color: '#64748b' },
  tabButtonTextActive: { color: '#3b82f6' },
  content: { flex: 1 },
  tabContent: { flex: 1, padding: 16 },
  tabHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  tabTitle: { fontSize: 18, fontWeight: '600', color: '#1e293b' },
  pendingBadge: { backgroundColor: '#fef3c7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  pendingBadgeText: { fontSize: 12, color: '#d97706', fontWeight: '500' },
  addButton: { backgroundColor: '#3b82f6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: '#e2e8f0' },
  cardContent: { flexDirection: 'row', marginBottom: 12 },
  avatarContainer: { marginRight: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 18, fontWeight: '600', color: '#64748b' },
  userInfo: { flex: 1 },
  groupImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  groupImagePlaceholder: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  groupImagePlaceholderText: { fontSize: 24, fontWeight: '600', color: '#64748b' },
  groupInfo: { flex: 1, justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 2 },
  cardSubtitle: { fontSize: 14, color: '#64748b', marginBottom: 4 },
  cardDescription: { fontSize: 13, color: '#64748b', marginBottom: 4 },
  cardMeta: { fontSize: 12, color: '#94a3b8' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 6 },
  badgeApproved: { backgroundColor: '#dcfce7' },
  badgePending: { backgroundColor: '#fef3c7' },
  badgeText: { fontSize: 11, fontWeight: '500' },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12 },
  approveButton: { backgroundColor: '#22c55e', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  approveButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  editButton: { backgroundColor: '#3b82f6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  editButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  deleteButton: { backgroundColor: '#ef4444', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  deleteButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyText: { textAlign: 'center', color: '#94a3b8', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 14, fontSize: 15, marginBottom: 12, backgroundColor: '#f8fafc' },
  textArea: { height: 80, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 },
  cancelButton: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  cancelButtonText: { color: '#64748b', fontWeight: '600', fontSize: 15 },
  submitButton: { backgroundColor: '#3b82f6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  submitButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});