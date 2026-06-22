import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import {
  DisplayMode,
  ConsentStatus,
  RelationshipType,
  Visibility,
  Person,
  Connection,
  Invitation,
  getDisplayName,
} from '../types';

interface Profile {
  id: string;
  alias: string;
  real_name: string | null;
  display_mode: DisplayMode;
  consent_status: ConsentStatus;
  created_at: string;
}

interface AppState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  people: Person[];
  connections: Connection[];
  invitations: Invitation[];
  loading: boolean;
}

interface AppContextType {
  state: AppState;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  createProfile: (alias: string, realName?: string, displayMode?: DisplayMode) => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  createInvitation: (inviteeEmail: string, proposedAlias: string, relationshipType: RelationshipType) => Promise<{ data: Invitation | null; error: Error | null }>;
  getInvitationByToken: (token: string) => Promise<Invitation | null>;
  acceptInvitation: (
    token: string,
    choice: 'anonymous' | 'with_name' | 'hide_connection' | 'reject',
    realName?: string
  ) => Promise<{ success: boolean; message: string; error?: Error }>;
  updatePerson: (personId: string, updates: Partial<Person>) => Promise<{ error: Error | null }>;
  updateConnection: (connectionId: string, updates: Partial<Connection>) => Promise<{ error: Error | null }>;
  hideConnection: (connectionId: string) => Promise<{ error: Error | null }>;
  revokeConsent: () => Promise<{ error: Error | null }>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

function formatPerson(row: Record<string, unknown>): Person {
  return {
    id: row.id as string,
    alias: row.alias as string,
    realName: (row.real_name as string | null) || undefined,
    displayMode: row.display_mode as DisplayMode,
    consentStatus: row.consent_status as ConsentStatus,
    createdAt: row.created_at as string,
    owner_id: (row.owner_id as string | null) || undefined,
    profile_id: (row.profile_id as string | null) || undefined,
  };
}

function formatConnection(row: Record<string, unknown>): Connection {
  return {
    id: row.id as string,
    sourcePersonId: row.source_person_id as string,
    targetPersonId: row.target_person_id as string,
    relationshipType: row.relationship_type as RelationshipType,
    sourceApproved: row.source_approved as boolean,
    targetApproved: row.target_approved as boolean,
    visibility: row.visibility as Visibility,
    createdAt: row.created_at as string,
    owner_id: row.owner_id as string,
  };
}

function formatInvitation(row: Record<string, unknown>): Invitation {
  return {
    id: row.id as string,
    inviter_id: row.inviter_id as string,
    inviteeEmail: row.invitee_email as string,
    proposedAlias: row.proposed_alias as string,
    proposedRelationshipType: row.proposed_relationship_type as RelationshipType,
    token: row.token as string,
    status: row.status as 'pending' | 'approved' | 'rejected' | 'expired',
    createdAt: row.created_at as string,
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    user: null,
    session: null,
    profile: null,
    people: [],
    connections: [],
    invitations: [],
    loading: true,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState((prev) => ({ ...prev, session, user: session?.user ?? null, loading: false }));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((prev) => ({ ...prev, session, user: session?.user ?? null }));
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (state.user) {
      refreshData();
    } else {
      setState((prev) => ({
        ...prev,
        profile: null,
        people: [],
        connections: [],
        invitations: [],
      }));
    }
  }, [state.user?.id]);

  const refreshData = useCallback(async () => {
    if (!state.user) return;

    try {
      const [profileRes, peopleRes, connectionsRes, invitationsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', state.user.id).maybeSingle(),
        supabase.from('people').select('*').eq('owner_id', state.user.id),
        supabase.from('connections').select('*').eq('owner_id', state.user.id),
        supabase.from('invitations').select('*').eq('inviter_id', state.user.id),
      ]);

      setState((prev) => ({
        ...prev,
        profile: (profileRes.data as Profile) || null,
        people: (peopleRes.data || []).map(formatPerson),
        connections: (connectionsRes.data || []).map(formatConnection),
        invitations: (invitationsRes.data || []).map(formatInvitation),
      }));
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }, [state.user]);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState((prev) => ({
      ...prev,
      user: null,
      session: null,
      profile: null,
      people: [],
      connections: [],
      invitations: [],
    }));
  }, []);

 const createProfile = useCallback(
  async (alias: string, realName?: string, displayMode: DisplayMode = 'anonymous') => {
    if (!state.user) {
      return { error: new Error('Not authenticated') };
    }

    // 1. Create or update the user's profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: state.user.id,
          alias,
          real_name: realName || null,
          display_mode: displayMode,
          consent_status: 'approved',
        },
        {
          onConflict: 'id',
        }
      );

    if (profileError) {
      return { error: profileError };
    }

    // 2. Also create or update the user's own node in the people table
    // This makes "me" appear as the center node in the graph.
    const { error: selfPersonError } = await supabase
      .from('people')
      .upsert(
        {
          owner_id: state.user.id,
          profile_id: state.user.id,
          alias,
          real_name: realName || null,
          display_mode: displayMode,
          consent_status: 'approved',
        },
        {
          onConflict: 'owner_id,profile_id',
        }
      );

    if (selfPersonError) {
      return { error: selfPersonError };
    }

    await refreshData();

    return { error: null };
  },
  [state.user, refreshData]
);

  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      if (!state.user) {
        return { error: new Error('Not authenticated') };
      }

      const { error } = await supabase.from('profiles').update(updates).eq('id', state.user.id);

      if (error) {
        return { error };
      }

      // Keep the user's self-node in people in sync with profile changes.
      const selfPersonUpdates: Record<string, unknown> = {};
      if (updates.alias !== undefined) selfPersonUpdates.alias = updates.alias;
      if (updates.real_name !== undefined) selfPersonUpdates.real_name = updates.real_name;
      if (updates.display_mode !== undefined) selfPersonUpdates.display_mode = updates.display_mode;
      if (updates.consent_status !== undefined) selfPersonUpdates.consent_status = updates.consent_status;

      if (Object.keys(selfPersonUpdates).length > 0) {
        await supabase
          .from('people')
          .upsert(
            {
              owner_id: state.user.id,
              profile_id: state.user.id,
              ...selfPersonUpdates,
            },
            { onConflict: 'owner_id,profile_id' }
          )
          .eq('profile_id', state.user.id);
      }

      await refreshData();
      return { error: null };
    },
    [state.user, refreshData]
  );

  const createInvitation = useCallback(
    async (inviteeEmail: string, proposedAlias: string, relationshipType: RelationshipType) => {
      if (!state.user) {
        return { data: null, error: new Error('Not authenticated') };
      }

      const { data, error } = await supabase
  .from('invitations')
  .insert({
    inviter_id: state.user.id,
    invitee_email: inviteeEmail || null,
    proposed_alias: proposedAlias,
    proposed_relationship_type: relationshipType,
    share_channel: 'link',
  })
  .select()
  .single();

      if (!error && data) {
        await refreshData();
        return { data: formatInvitation(data), error: null };
      }

      return { data: null, error };
    },
    [state.user, refreshData]
  );

  const getInvitationByToken = useCallback(async (token: string): Promise<Invitation | null> => {
    const { data } = await supabase.from('invitations').select('*').eq('token', token).maybeSingle();
    return data ? formatInvitation(data) : null;
  }, []);

  const acceptInvitation = useCallback(
    async (
      token: string,
      choice: 'anonymous' | 'with_name' | 'hide_connection' | 'reject',
      realName?: string
    ): Promise<{ success: boolean; message: string; error?: Error }> => {
      const invitation = await getInvitationByToken(token);
      if (!invitation) {
        return { success: false, message: 'Invitation not found' };
      }
      if (invitation.status !== 'pending') {
        return { success: false, message: 'Invitation already processed' };
      }

      if (choice === 'reject') {
        const { error } = await supabase.from('invitations').update({ status: 'rejected' }).eq('token', token);
        if (error) {
          return { success: false, message: 'Failed to reject invitation', error };
        }
        return { success: true, message: 'Invitation declined' };
      }

      const displayMode: DisplayMode = choice === 'anonymous' ? 'anonymous' : choice === 'with_name' ? 'real_name' : 'anonymous';
      const visibility: Visibility = choice === 'hide_connection' ? 'private' : 'visible';

      const currentUserId = state.user?.id;

if (!currentUserId) {
  return { success: false, message: 'Not authenticated' };
}

// 1. Find the inviter's profile.
// invitation.inviter_id is an auth user id, not a people.id.
const { data: inviterProfile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', invitation.inviter_id)
  .maybeSingle();

const inviterAlias = inviterProfile?.alias || 'Inviter';
const inviterRealName = inviterProfile?.real_name || null;
const inviterDisplayMode = inviterProfile?.display_mode || 'anonymous';

// 2. Make sure the inviter also exists as a node in this user's people table.
let { data: sourcePerson, error: sourceLookupError } = await supabase
  .from('people')
  .select('*')
  .eq('owner_id', currentUserId)
  .eq('profile_id', invitation.inviter_id)
  .maybeSingle();

if (sourceLookupError) {
  return {
    success: false,
    message: 'Failed to look up inviter node',
    error: sourceLookupError,
  };
}

if (!sourcePerson) {
  const { data: createdSourcePerson, error: sourceCreateError } = await supabase
    .from('people')
    .insert({
      owner_id: currentUserId,
      profile_id: invitation.inviter_id,
      alias: inviterAlias,
      real_name: inviterRealName,
      display_mode: inviterDisplayMode,
      consent_status: 'approved',
    })
    .select()
    .single();

  if (sourceCreateError || !createdSourcePerson) {
    return {
      success: false,
      message: 'Failed to create inviter node',
      error: sourceCreateError,
    };
  }

  sourcePerson = createdSourcePerson;
}

// 3. Create the invited person as a people node.
const { data: newPerson, error: personError } = await supabase
  .from('people')
  .insert({
    alias: invitation.proposedAlias || 'Anonymous Star',
    real_name: choice === 'with_name' && realName ? realName : null,
    display_mode: displayMode,
    consent_status: 'approved',
    owner_id: currentUserId,
  })
  .select()
  .single();

if (personError || !newPerson) {
  return { success: false, message: 'Failed to create person', error: personError };
}

// 4. Create the connection using people.id values, not auth user ids.
const { error: connectionError } = await supabase.from('connections').insert({
  owner_id: currentUserId,
  source_person_id: sourcePerson.id,
  target_person_id: newPerson.id,
  relationship_type: invitation.proposedRelationshipType,
  source_approved: true,
  target_approved: true,
  visibility,
});

if (connectionError) {
  return { success: false, message: 'Failed to create connection', error: connectionError };
}

      if (connectionError) {
        return { success: false, message: 'Failed to create connection', error: connectionError };
      }

      const { error: updateError } = await supabase.from('invitations').update({ status: 'approved' }).eq('token', token);

      if (updateError) {
        return { success: false, message: 'Failed to update invitation', error: updateError };
      }

      await refreshData();
      return { success: true, message: 'Welcome to the constellation!' };
    },
    [getInvitationByToken, refreshData, state.user]
  );

  const updatePerson = useCallback(
    async (personId: string, updates: Partial<Person>) => {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.realName !== undefined) dbUpdates.real_name = updates.realName;
      if (updates.displayMode) dbUpdates.display_mode = updates.displayMode;
      if (updates.consentStatus) dbUpdates.consent_status = updates.consentStatus;

      const { error } = await supabase.from('people').update(dbUpdates).eq('id', personId);

      if (!error) {
        await refreshData();
      }

      return { error };
    },
    [refreshData]
  );

  const updateConnection = useCallback(
    async (connectionId: string, updates: Partial<Connection>) => {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.visibility) dbUpdates.visibility = updates.visibility;
      if (updates.sourceApproved !== undefined) dbUpdates.source_approved = updates.sourceApproved;
      if (updates.targetApproved !== undefined) dbUpdates.target_approved = updates.targetApproved;

      const { error } = await supabase.from('connections').update(dbUpdates).eq('id', connectionId);

      if (!error) {
        await refreshData();
      }

      return { error };
    },
    [refreshData]
  );

  const hideConnection = useCallback(
    async (connectionId: string) => {
      return updateConnection(connectionId, { visibility: 'private' });
    },
    [updateConnection]
  );

  const revokeConsent = useCallback(async () => {
    if (!state.user) {
      return { error: new Error('Not authenticated') };
    }

    const { error } = await supabase.from('profiles').update({ consent_status: 'revoked' }).eq('id', state.user.id);

    if (!error) {
      await refreshData();
    }

    return { error };
  }, [state.user, refreshData]);

  const value: AppContextType = {
    state,
    signUp,
    signIn,
    signOut,
    createProfile,
    updateProfile,
    createInvitation,
    getInvitationByToken,
    acceptInvitation,
    updatePerson,
    updateConnection,
    hideConnection,
    revokeConsent,
    refreshData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

export { getDisplayName };
