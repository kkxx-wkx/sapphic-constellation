export type DisplayMode = 'anonymous' | 'hybrid' | 'real_name';

export type ConsentStatus = 'approved' | 'pending' | 'rejected' | 'revoked';

export type RelationshipType = 'friend' | 'date' | 'same_event' | 'introduced_by_friend';

export type Visibility = 'visible' | 'private' | 'mutual_only';

export interface Person {
  id: string;
  owner_id?: string | null;
  profile_id?: string | null;
  alias: string;
  realName?: string | null;
  displayMode: DisplayMode;
  consentStatus: ConsentStatus;
  createdAt: string;
}

export interface Connection {
  id: string;
  sourcePersonId: string;
  targetPersonId: string;
  relationshipType: RelationshipType;
  sourceApproved: boolean;
  targetApproved: boolean;
  visibility: Visibility;
  createdAt: string;
  owner_id?: string;
}

export interface Invitation {
  id: string;
  inviter_id: string;
  inviteeEmail: string;
  proposedAlias: string;
  proposedRelationshipType: RelationshipType;
  token: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  createdAt: string;
}

export const getDisplayName = (person: Person): string => {
  switch (person.displayMode) {
    case 'real_name':
      return person.realName || person.alias;
    case 'hybrid':
      return person.alias;
    case 'anonymous':
      return 'Anonymous Star';
  }
};

export const getRelationshipLabel = (type: RelationshipType): string => {
  switch (type) {
    case 'friend':
      return 'Friend';
    case 'date':
      return 'Dated';
    case 'same_event':
      return 'Same Event';
    case 'introduced_by_friend':
      return 'Introduced by Friend';
  }
};

export const relationshipColors: Record<RelationshipType, string> = {
  friend: '#60a5fa',
  date: '#f472b6',
  same_event: '#34d399',
  introduced_by_friend: '#a78bfa',
};
