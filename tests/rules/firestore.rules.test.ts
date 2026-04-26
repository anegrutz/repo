import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';

let testEnv: RulesTestEnvironment;

const ALICE = 'alice';
const BOB = 'bob';
const CARLOS = 'carlos';

function nlAdultClaims() {
  return { country: 'NL', ageVerifiedAt: 1700000000000 };
}

function nlBaseProfile(uid: string) {
  return {
    displayName: `User ${uid}`,
    bio: '',
    vibe: 'indica' as const,
    munchies: ['pizza'],
    photos: [],
    country: 'NL',
    ageVerifiedAt: 1700000000000,
    createdAt: 1700000000000,
    lastActiveAt: 1700000000000,
  };
}

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'puffmatch-rules-test',
    firestore: {
      rules: readFileSync(resolve(__dirname, '../../firestore.rules'), 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe('users collection', () => {
  it('lets an adult NL user create their own profile', async () => {
    const ctx = testEnv.authenticatedContext(ALICE, nlAdultClaims());
    await assertSucceeds(ctx.firestore().doc(`users/${ALICE}`).set(nlBaseProfile(ALICE)));
  });

  it('blocks creating a profile with a non-NL country', async () => {
    const ctx = testEnv.authenticatedContext(ALICE, nlAdultClaims());
    await assertFails(
      ctx.firestore().doc(`users/${ALICE}`).set({ ...nlBaseProfile(ALICE), country: 'DE' }),
    );
  });

  it("blocks writing someone else's profile", async () => {
    const ctx = testEnv.authenticatedContext(ALICE, nlAdultClaims());
    await assertFails(ctx.firestore().doc(`users/${BOB}`).set(nlBaseProfile(BOB)));
  });

  it('blocks reads from users without an NL+age-verified token', async () => {
    await testEnv.withSecurityRulesDisabled(async (admin) => {
      await admin.firestore().doc(`users/${BOB}`).set(nlBaseProfile(BOB));
    });
    const ctx = testEnv.authenticatedContext(ALICE, { country: 'DE', ageVerifiedAt: 1 });
    await assertFails(ctx.firestore().doc(`users/${BOB}`).get());
  });

  it('lets an NL+age-verified user read other profiles', async () => {
    await testEnv.withSecurityRulesDisabled(async (admin) => {
      await admin.firestore().doc(`users/${BOB}`).set(nlBaseProfile(BOB));
    });
    const ctx = testEnv.authenticatedContext(ALICE, nlAdultClaims());
    await assertSucceeds(ctx.firestore().doc(`users/${BOB}`).get());
  });

  it('blocks tampering with own ageVerifiedAt on update', async () => {
    await testEnv.withSecurityRulesDisabled(async (admin) => {
      await admin.firestore().doc(`users/${ALICE}`).set(nlBaseProfile(ALICE));
    });
    const ctx = testEnv.authenticatedContext(ALICE, nlAdultClaims());
    await assertFails(
      ctx.firestore().doc(`users/${ALICE}`).set(
        { ...nlBaseProfile(ALICE), ageVerifiedAt: 9999999999999 },
        { merge: true },
      ),
    );
  });
});

describe('swipes', () => {
  it('lets a user record their own swipe', async () => {
    const ctx = testEnv.authenticatedContext(ALICE, nlAdultClaims());
    await assertSucceeds(
      ctx.firestore().doc(`swipes/${ALICE}/targets/${BOB}`).set({
        direction: 'ash',
        createdAt: Date.now(),
      }),
    );
  });

  it("blocks writing swipes under someone else's uid", async () => {
    const ctx = testEnv.authenticatedContext(ALICE, nlAdultClaims());
    await assertFails(
      ctx.firestore().doc(`swipes/${BOB}/targets/${ALICE}`).set({
        direction: 'ash',
        createdAt: Date.now(),
      }),
    );
  });
});

describe('matches and messages', () => {
  it('blocks non-participants from reading a match', async () => {
    await testEnv.withSecurityRulesDisabled(async (admin) => {
      await admin
        .firestore()
        .doc(`matches/${ALICE}_${BOB}`)
        .set({ users: [ALICE, BOB], createdAt: 1, status: 'active', lastMessageAt: null });
    });
    const ctx = testEnv.authenticatedContext(CARLOS, nlAdultClaims());
    await assertFails(ctx.firestore().doc(`matches/${ALICE}_${BOB}`).get());
  });

  it('lets participants read their own match', async () => {
    await testEnv.withSecurityRulesDisabled(async (admin) => {
      await admin
        .firestore()
        .doc(`matches/${ALICE}_${BOB}`)
        .set({ users: [ALICE, BOB], createdAt: 1, status: 'active', lastMessageAt: null });
    });
    const ctx = testEnv.authenticatedContext(BOB, nlAdultClaims());
    await assertSucceeds(ctx.firestore().doc(`matches/${ALICE}_${BOB}`).get());
  });

  it('blocks creating a match doc directly from the client', async () => {
    const ctx = testEnv.authenticatedContext(ALICE, nlAdultClaims());
    await assertFails(
      ctx.firestore().doc(`matches/${ALICE}_${BOB}`).set({
        users: [ALICE, BOB],
        createdAt: 1,
        status: 'active',
        lastMessageAt: null,
      }),
    );
  });

  it('blocks writing a message under a match the user is not part of', async () => {
    await testEnv.withSecurityRulesDisabled(async (admin) => {
      await admin
        .firestore()
        .doc(`matches/${ALICE}_${BOB}`)
        .set({ users: [ALICE, BOB], createdAt: 1, status: 'active', lastMessageAt: null });
    });
    const ctx = testEnv.authenticatedContext(CARLOS, nlAdultClaims());
    await assertFails(
      ctx
        .firestore()
        .doc(`matches/${ALICE}_${BOB}/messages/m1`)
        .set({ senderId: CARLOS, text: 'sneaky', createdAt: Date.now(), readBy: [CARLOS] }),
    );
  });

  it('blocks spoofing senderId on a message', async () => {
    await testEnv.withSecurityRulesDisabled(async (admin) => {
      await admin
        .firestore()
        .doc(`matches/${ALICE}_${BOB}`)
        .set({ users: [ALICE, BOB], createdAt: 1, status: 'active', lastMessageAt: null });
    });
    const ctx = testEnv.authenticatedContext(ALICE, nlAdultClaims());
    await assertFails(
      ctx
        .firestore()
        .doc(`matches/${ALICE}_${BOB}/messages/m1`)
        .set({ senderId: BOB, text: 'forged', createdAt: Date.now(), readBy: [ALICE] }),
    );
  });

  it('rejects oversized messages (> 2000 chars)', async () => {
    await testEnv.withSecurityRulesDisabled(async (admin) => {
      await admin
        .firestore()
        .doc(`matches/${ALICE}_${BOB}`)
        .set({ users: [ALICE, BOB], createdAt: 1, status: 'active', lastMessageAt: null });
    });
    const ctx = testEnv.authenticatedContext(ALICE, nlAdultClaims());
    await assertFails(
      ctx
        .firestore()
        .doc(`matches/${ALICE}_${BOB}/messages/m1`)
        .set({
          senderId: ALICE,
          text: 'x'.repeat(2001),
          createdAt: Date.now(),
          readBy: [ALICE],
        }),
    );
  });
});

describe('reports', () => {
  it('lets an authenticated user file a report under their own reporterId', async () => {
    const ctx = testEnv.authenticatedContext(ALICE, nlAdultClaims());
    await assertSucceeds(
      ctx.firestore().collection('reports').add({
        reporterId: ALICE,
        reportedId: BOB,
        reason: 'harassment',
        createdAt: Date.now(),
        status: 'pending',
      }),
    );
  });

  it("blocks filing a report under someone else's reporterId", async () => {
    const ctx = testEnv.authenticatedContext(ALICE, nlAdultClaims());
    await assertFails(
      ctx.firestore().collection('reports').add({
        reporterId: BOB,
        reportedId: CARLOS,
        reason: 'spam',
        createdAt: Date.now(),
        status: 'pending',
      }),
    );
  });

  it('blocks reading any report from the client', async () => {
    await testEnv.withSecurityRulesDisabled(async (admin) => {
      await admin
        .firestore()
        .collection('reports')
        .add({ reporterId: ALICE, reportedId: BOB, reason: 'spam' });
    });
    const ctx = testEnv.authenticatedContext(ALICE, nlAdultClaims());
    await assertFails(ctx.firestore().collection('reports').get());
  });
});
