// Database Operations

// Contacts
const contactsDB = {
    async addContact(phoneNumber, name) {
        try {
            if (!currentUser) throw new Error('User not authenticated');

            const usersSnapshot = await db.collection('users')
                .where('phoneNumber', '==', phoneNumber)
                .limit(1)
                .get();

            if (usersSnapshot.empty) {
                throw new Error('User not found');
            }

            const targetUser = usersSnapshot.docs[0].data();
            
            const contactRef = db.collection('contacts').doc();
            await contactRef.set({
                userId: currentUser.uid,
                contactId: targetUser.uid,
                contactName: name,
                contactPhone: phoneNumber,
                contactAvatar: targetUser.photoURL,
                addedAt: new Date()
            });

            return { success: true, contactId: targetUser.uid };
        } catch (error) {
            console.error('Error adding contact:', error);
            throw error;
        }
    },

    async getContacts() {
        try {
            if (!currentUser) throw new Error('User not authenticated');

            const snapshot = await db.collection('contacts')
                .where('userId', '==', currentUser.uid)
                .orderBy('addedAt', 'desc')
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting contacts:', error);
            throw error;
        }
    },

    async deleteContact(contactId) {
        try {
            if (!currentUser) throw new Error('User not authenticated');

            const snapshot = await db.collection('contacts')
                .where('userId', '==', currentUser.uid)
                .where('id', '==', contactId)
                .get();

            snapshot.docs.forEach(doc => doc.ref.delete());
            return { success: true };
        } catch (error) {
            console.error('Error deleting contact:', error);
            throw error;
        }
    },

    async searchContact(phoneNumber) {
        try {
            const usersSnapshot = await db.collection('users')
                .where('phoneNumber', '==', phoneNumber)
                .limit(1)
                .get();

            if (usersSnapshot.empty) {
                return null;
            }

            return usersSnapshot.docs[0].data();
        } catch (error) {
            console.error('Error searching contact:', error);
            throw error;
        }
    }
};

// Chats
const chatsDB = {
    async getChatId(userId1, userId2) {
        const ids = [userId1, userId2].sort();
        return `${ids[0]}_${ids[1]}`;
    },

    async getOrCreateChat(otherUserId) {
        try {
            if (!currentUser) throw new Error('User not authenticated');

            const chatId = await this.getChatId(currentUser.uid, otherUserId);
            const chatRef = db.collection('chats').doc(chatId);
            const chatDoc = await chatRef.get();

            if (!chatDoc.exists) {
                const otherUserData = await getUserProfile(otherUserId);
                await chatRef.set({
                    participants: [currentUser.uid, otherUserId],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    lastMessage: null,
                    lastMessageTime: null,
                    metadata: {
                        [currentUser.uid]: {
                            displayName: currentUserData.displayName,
                            photoURL: currentUserData.photoURL
                        },
                        [otherUserId]: {
                            displayName: otherUserData.displayName,
                            photoURL: otherUserData.photoURL
                        }
                    }
                });
            }

            return chatId;
        } catch (error) {
            console.error('Error getting/creating chat:', error);
            throw error;
        }
    },

    async getChats() {
        try {
            if (!currentUser) throw new Error('User not authenticated');

            const snapshot = await db.collection('chats')
                .where('participants', 'array-contains', currentUser.uid)
                .orderBy('updatedAt', 'desc')
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting chats:', error);
            throw error;
        }
    },

    listenToChats(callback) {
        try {
            if (!currentUser) throw new Error('User not authenticated');

            return db.collection('chats')
                .where('participants', 'array-contains', currentUser.uid)
                .orderBy('updatedAt', 'desc')
                .onSnapshot(snapshot => {
                    const chats = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    callback(chats);
                });
        } catch (error) {
            console.error('Error listening to chats:', error);
        }
    },

    async deleteChat(chatId) {
        try {
            const chatRef = db.collection('chats').doc(chatId);
            const messagesSnapshot = await chatRef.collection('messages').get();
            
            const batch = db.batch();
            messagesSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            batch.delete(chatRef);
            
            await batch.commit();
            return { success: true };
        } catch (error) {
            console.error('Error deleting chat:', error);
            throw error;
        }
    }
};

// Messages
const messagesDB = {
    async sendMessage(chatId, content, type = 'text', metadata = {}) {
        try {
            if (!currentUser) throw new Error('User not authenticated');

            const messageRef = db.collection('chats').doc(chatId).collection('messages').doc();
            const message = {
                id: messageRef.id,
                senderId: currentUser.uid,
                content,
                type,
                metadata,
                timestamp: new Date(),
                seen: false,
                seenBy: []
            };

            await messageRef.set(message);

            // Update chat's last message
            await db.collection('chats').doc(chatId).update({
                lastMessage: content,
                lastMessageTime: new Date(),
                updatedAt: new Date()
            });

            return message;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },

    async getMessages(chatId, limit = 50) {
        try {
            const snapshot = await db.collection('chats')
                .doc(chatId)
                .collection('messages')
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })).reverse();
        } catch (error) {
            console.error('Error getting messages:', error);
            throw error;
        }
    },

    listenToMessages(chatId, callback) {
        try {
            return db.collection('chats')
                .doc(chatId)
                .collection('messages')
                .orderBy('timestamp', 'asc')
                .onSnapshot(snapshot => {
                    const messages = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    callback(messages);
                });
        } catch (error) {
            console.error('Error listening to messages:', error);
        }
    },

    async markAsSeen(chatId, messageIds) {
        try {
            if (!currentUser) throw new Error('User not authenticated');

            const batch = db.batch();
            const messagesRef = db.collection('chats').doc(chatId).collection('messages');

            for (const msgId of messageIds) {
                const docRef = messagesRef.doc(msgId);
                batch.update(docRef, {
                    seen: true,
                    seenBy: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
                });
            }

            await batch.commit();
        } catch (error) {
            console.error('Error marking messages as seen:', error);
        }
    },

    async deleteMessage(chatId, messageId) {
        try {
            await db.collection('chats')
                .doc(chatId)
                .collection('messages')
                .doc(messageId)
                .delete();
        } catch (error) {
            console.error('Error deleting message:', error);
            throw error;
        }
    }
};

// Groups
const groupsDB = {
    async createGroup(name, members, photoURL = null) {
        try {
            if (!currentUser) throw new Error('User not authenticated');

            const groupRef = db.collection('groups').doc();
            const groupMembers = [currentUser.uid, ...members];

            await groupRef.set({
                id: groupRef.id,
                name,
                photoURL: photoURL || getDefaultAvatar(name),
                createdBy: currentUser.uid,
                members: groupMembers,
                admins: [currentUser.uid],
                createdAt: new Date(),
                updatedAt: new Date(),
                lastMessage: null,
                lastMessageTime: null
            });

            return { id: groupRef.id, success: true };
        } catch (error) {
            console.error('Error creating group:', error);
            throw error;
        }
    },

    async getGroups() {
        try {
            if (!currentUser) throw new Error('User not authenticated');

            const snapshot = await db.collection('groups')
                .where('members', 'array-contains', currentUser.uid)
                .orderBy('updatedAt', 'desc')
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting groups:', error);
            throw error;
        }
    },

    async addMembersToGroup(groupId, memberIds) {
        try {
            const groupRef = db.collection('groups').doc(groupId);
            
            for (const memberId of memberIds) {
                await groupRef.update({
                    members: firebase.firestore.FieldValue.arrayUnion(memberId)
                });
            }

            return { success: true };
        } catch (error) {
            console.error('Error adding members:', error);
            throw error;
        }
    },

    async removeMemberFromGroup(groupId, memberId) {
        try {
            const groupRef = db.collection('groups').doc(groupId);
            
            await groupRef.update({
                members: firebase.firestore.FieldValue.arrayRemove(memberId)
            });

            return { success: true };
        } catch (error) {
            console.error('Error removing member:', error);
            throw error;
        }
    },

    async updateGroupInfo(groupId, updates) {
        try {
            const groupRef = db.collection('groups').doc(groupId);
            updates.updatedAt = new Date();
            
            await groupRef.update(updates);
            return { success: true };
        } catch (error) {
            console.error('Error updating group:', error);
            throw error;
        }
    },

    async deleteGroup(groupId) {
        try {
            const groupRef = db.collection('groups').doc(groupId);
            const messagesSnapshot = await groupRef.collection('messages').get();
            
            const batch = db.batch();
            messagesSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            batch.delete(groupRef);
            
            await batch.commit();
            return { success: true };
        } catch (error) {
            console.error('Error deleting group:', error);
            throw error;
        }
    }
};

// Group Messages
const groupMessagesDB = {
    async sendGroupMessage(groupId, content, type = 'text', metadata = {}) {
        try {
            if (!currentUser) throw new Error('User not authenticated');

            const messageRef = db.collection('groups').doc(groupId).collection('messages').doc();
            const message = {
                id: messageRef.id,
                senderId: currentUser.uid,
                senderName: currentUserData.displayName,
                senderAvatar: currentUserData.photoURL,
                content,
                type,
                metadata,
                timestamp: new Date(),
                seenBy: []
            };

            await messageRef.set(message);

            // Update group's last message
            await db.collection('groups').doc(groupId).update({
                lastMessage: content,
                lastMessageTime: new Date(),
                updatedAt: new Date()
            });

            return message;
        } catch (error) {
            console.error('Error sending group message:', error);
            throw error;
        }
    },

    async getGroupMessages(groupId, limit = 50) {
        try {
            const snapshot = await db.collection('groups')
                .doc(groupId)
                .collection('messages')
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })).reverse();
        } catch (error) {
            console.error('Error getting group messages:', error);
            throw error;
        }
    },

    listenToGroupMessages(groupId, callback) {
        try {
            return db.collection('groups')
                .doc(groupId)
                .collection('messages')
                .orderBy('timestamp', 'asc')
                .onSnapshot(snapshot => {
                    const messages = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    callback(messages);
                });
        } catch (error) {
            console.error('Error listening to group messages:', error);
        }
    }
};

// Calls
const callsDB = {
    async createCall(callerId, calleeId, type = 'audio') {
        try {
            const callRef = db.collection('calls').doc();
            const call = {
                id: callRef.id,
                callerId,
                calleeId,
                type,
                status: 'pending',
                startTime: new Date(),
                endTime: null,
                duration: 0
            };

            await callRef.set(call);
            return call;
        } catch (error) {
            console.error('Error creating call:', error);
            throw error;
        }
    },

    async updateCallStatus(callId, status) {
        try {
            await db.collection('calls').doc(callId).update({
                status,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Error updating call status:', error);
        }
    },

    async endCall(callId) {
        try {
            const callRef = db.collection('calls').doc(callId);
            const callDoc = await callRef.get();
            const call = callDoc.data();
            const duration = Math.floor((new Date() - call.startTime.toDate()) / 1000);

            await callRef.update({
                status: 'ended',
                endTime: new Date(),
                duration
            });
        } catch (error) {
            console.error('Error ending call:', error);
        }
    },

    async getCallHistory(limit = 20) {
        try {
            if (!currentUser) throw new Error('User not authenticated');

            const snapshot = await db.collection('calls')
                .where('callerId', '==', currentUser.uid)
                .orderBy('startTime', 'desc')
                .limit(limit)
                .get();

            const calleeSnapshot = await db.collection('calls')
                .where('calleeId', '==', currentUser.uid)
                .orderBy('startTime', 'desc')
                .limit(limit)
                .get();

            const calls = [
                ...snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
                ...calleeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            ];

            return calls.sort((a, b) => b.startTime - a.startTime).slice(0, limit);
        } catch (error) {
            console.error('Error getting call history:', error);
            throw error;
        }
    }
};

// Typing Status
const typingDB = {
    async setTyping(chatId, isTyping) {
        try {
            if (!currentUser) return;

            const typingRef = db.collection('typing').doc(chatId);
            if (isTyping) {
                await typingRef.set({
                    [currentUser.uid]: new Date()
                }, { merge: true });

                setTimeout(() => {
                    this.setTyping(chatId, false);
                }, 3000);
            } else {
                await typingRef.update({
                    [currentUser.uid]: firebase.firestore.FieldValue.delete()
                });
            }
        } catch (error) {
            console.error('Error setting typing status:', error);
        }
    },

    listenToTyping(chatId, callback) {
        try {
            return db.collection('typing').doc(chatId)
                .onSnapshot(doc => {
                    const typing = doc.exists ? doc.data() : {};
                    const typingUsers = Object.keys(typing).filter(uid => uid !== currentUser.uid);
                    callback(typingUsers);
                });
        } catch (error) {
            console.error('Error listening to typing:', error);
        }
    }
};

// Notification
const notificationsDB = {
    async sendNotification(userId, title, body, data = {}) {
        try {
            const notificationsRef = db.collection('notifications').doc();
            await notificationsRef.set({
                userId,
                title,
                body,
                data,
                read: false,
                createdAt: new Date()
            });
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    }
};

// Export for use in other files
window.db_operations = {
    contacts: contactsDB,
    chats: chatsDB,
    messages: messagesDB,
    groups: groupsDB,
    groupMessages: groupMessagesDB,
    calls: callsDB,
    typing: typingDB,
    notifications: notificationsDB
};
