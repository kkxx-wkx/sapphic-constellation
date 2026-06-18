# Sapphic Constellation Testing Checklist

## 1. Auth / Profile
- [☑️] Can sign up / log in
- [☑️] Can create profile
- [☑️] Profile data is saved in Supabase
- [☑️] Refresh page still keeps user logged in

## 2. Invite Link
- [☑️] Can go to /invite
- [☑️] Can create invite link without email
- [☑️] Can copy invite link
- [☑️] Invite link opens /consent/:token page

## 3. Consent Page
- [☑️] Anonymous option can be selected
- [☑️] With My Name option can be selected
- [☑️] Join Privately option can be selected
- [☑️] Reject option can be selected
- [☑️] Accept button works
- [☑️] Reject button works

## 4. Database
- [☑️] Approved consent creates one person in people table
- [☑️] Approved consent creates one connection in connections table
- [☑️] Rejected invitation does not create connection
- [☑️] Invitation status changes after response

## 5. Graph
- [☑️] /graph page opens successfully
- [☑️] Approved people appear as nodes
- [☑️] Approved visible connections appear as lines
- [☑️] Private connections do not appear publicly
- [☑️] Filter panel still works

## 6. Basic UX
- [☑️] Landing page buttons work
- [☑️] Invite page buttons work
- [☑️] Consent page does not get stuck
- [☑️] No obvious console error