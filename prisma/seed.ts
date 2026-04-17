import { prisma } from "./client";
// added api key test user generation for api tests (can be removed in final production solely for tests)
import bcrypt from "bcryptjs";

const roles = async () => {
    await prisma.role.upsert({
        where: {
            id: 1
        },
        create: {
            id: 1,
            name: "USER"
        },
        update: {}
    });

    await prisma.role.upsert({
        where: {
            id: 2
        },
        create: {
            id: 2,
            name: "ADMIN"
        },
        update: {}
    });

    await prisma.role.upsert({
        where: {
            id: 3
        },
        create: {
            id: 3,
            name: "GROUP_MANAGER"
        },
        update: {}
    });

    console.log("roles are synced");
};

const groups = async () => {
    const groupCount = await prisma.group.count();

    if (groupCount === 0) {
        const defaultGroup = await prisma.group.create({
            data: {
                name: "Default"
            }
        });

        const allUsers = await prisma.user.findMany();
        for (const user of allUsers) {
            await prisma.userGroupMembership.create({
                data: {
                    active: true,
                    user: {
                        connect: {
                            id: user.id
                        }
                    },
                    group: {
                        connect: {
                            id: defaultGroup.id
                        }
                    }
                }
            });
        }

        console.log("created default group");
    } else {
        console.log("skipping default group creation");
    }
};
// added functionality for creating a test user (solely needed for api tests and CI )
const apiTestData = async () => {
    // extract API_KEY from the .env.test file
    const plaintextKey = process.env.TEST_API_KEY;

    if (!plaintextKey) {
        console.log("TEST_API_KEY not set; skipping API test data");
        return;
    }
    // contents of a test user
    const email = "apitest@example.com";
    const username = "apitest";
    const name = "API Test";
    const hashedPassword = await bcrypt.hash("TestAPI#1234", 10);
    // assigning to a default group
    const defaultGroup = await prisma.group.findFirst({
        where: { name: "Default" }
    });

    if (!defaultGroup) {
        throw new Error("Default group not found");
    }
    // create user with fields if not already made in db
    let user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        user = await prisma.user.create({
            data: {
                username,
                name,
                email,
                hashedPassword,
                roleId: 1
            }
        });
    }
    // create an exisiting membership for the test user if one doesn't exist
    const existingMembership = await prisma.userGroupMembership.findFirst({
        where: {
            userId: user.id,
            groupId: defaultGroup.id
        }
    });

    if (!existingMembership) {
        await prisma.userGroupMembership.create({
            data: {
                active: true,
                userId: user.id,
                groupId: defaultGroup.id,
                roleId: 1
            }
        });
    }
    // if test list doesn't exist make one
    const existingList = await prisma.list.findFirst({
        where: {
            ownerId: user.id,
            name: "Test Wishlist"
        }
    });

    if (!existingList) {
        await prisma.list.create({
            data: {
                name: "Test Wishlist",
                ownerId: user.id,
                groupId: defaultGroup.id,
                public: false
            }
        });
        console.log("created API test wishlist");
    }
    else {
        console.log("API test wishlist already exists");
    }
    // hashing and prefix for api key
    const keyPrefix = plaintextKey.slice(0, 12);
    const keyHash = await bcrypt.hash(plaintextKey, 10);
    // delete preexisting api keys (if they already exist)
    await prisma.apiKey.deleteMany({
        where: {
            userId: user.id,
            keyPrefix
        }
    });
    // create the key
    await prisma.apiKey.create({
        data: {
            name: "Test Key",
            keyHash,
            keyPrefix,
            userId: user.id,
            expiresAt: null
        }
    });
    console.log("made API test key");
};

const main = async () => {
    await roles();
    await groups();
    // added
    await apiTestData();
};

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);

        await prisma.$disconnect();
        process.exit(1);
    });