import type { UserSummary, WorkspaceData } from "@/lib/types/app";
import type { MembershipRole } from "@/lib/types/database";

const now = Date.now();

function isoMinutesFromNow(minutes: number) {
  return new Date(now + minutes * 60 * 1000).toISOString();
}

function isoHoursFromNow(hours: number) {
  return new Date(now + hours * 60 * 60 * 1000).toISOString();
}

function uniqueUsers(users: UserSummary[]) {
  return users.filter(
    (user, index, collection) =>
      collection.findIndex((candidate) => candidate.id === user.id) === index,
  );
}

export function getDemoWorkspaceData(
  role: "student" | "teacher" | "admin" = "teacher",
): WorkspaceData {
  const teacher: UserSummary = {
    id: "user-anna",
    fullName: "Anna Mercer",
    handle: "annamercer",
    email: "anna.mercer@schoolhub.edu",
    avatarUrl: null,
    role: "teacher",
    headline: "Design lead and advisory teacher",
    points: 128,
  };

  const admin: UserSummary = {
    id: "user-admin",
    fullName: "School Hub Admin",
    handle: "schoolhubadmin",
    email: "admin@schoolhub.local",
    avatarUrl: null,
    role: "admin",
    headline: "System admin and rollout lead",
    points: 320,
  };

  const studentOne: UserSummary = {
    id: "user-jai",
    fullName: "Jai Raman",
    handle: "jai",
    email: "jai.raman@schoolhub.edu",
    avatarUrl: null,
    role: "student",
    headline: "Visual storytelling club",
    points: 82,
  };

  const studentTwo: UserSummary = {
    id: "user-mila",
    fullName: "Mila Hart",
    handle: "mila",
    email: "mila.hart@schoolhub.edu",
    avatarUrl: null,
    role: "student",
    headline: "Science guild volunteer",
    points: 91,
  };

  const studentThree: UserSummary = {
    id: "user-omar",
    fullName: "Omar Lewis",
    handle: "omar",
    email: "omar.lewis@schoolhub.edu",
    avatarUrl: null,
    role: "student",
    headline: "Physics lab assistant",
    points: 74,
  };

  const currentUser =
    role === "admin" ? admin : role === "student" ? studentOne : teacher;
  const currentMembershipRole: MembershipRole =
    currentUser.role === "admin"
      ? "admin"
      : currentUser.role === "teacher"
        ? "teacher"
        : "member";

  const departments = [
    {
      id: "dept-lobby",
      slug: "general-lobby",
      name: "General Lobby",
      description: "School-wide updates, huddles, and announcements.",
      emoji: null,
      color: "#d9caee",
      isLobby: true,
      membershipRole: currentMembershipRole,
      memberCount: 84,
    },
    {
      id: "dept-design",
      slug: "design-lab",
      name: "Design Lab",
      description: "Creative briefs, feedback, and portfolio prep.",
      emoji: null,
      color: "#efbfd3",
      isLobby: false,
      membershipRole: currentMembershipRole,
      memberCount: 26,
    },
    {
      id: "dept-science",
      slug: "science-guild",
      name: "Science Guild",
      description: "Research, project support, and peer tutoring.",
      emoji: null,
      color: "#bfe0e4",
      isLobby: false,
      membershipRole: currentMembershipRole,
      memberCount: 31,
    },
  ];

  return {
    kind: "workspace",
    currentUser,
    departments,
    directThreads: [
      {
        id: "thread-mentors",
        title: "Advisory Mentors",
        isGroup: true,
        createdAt: isoHoursFromNow(-30),
        participants: uniqueUsers([currentUser, teacher, studentTwo]),
        lastMessagePreview: "Can we pin the review rubric before the critique?",
      },
      {
        id: "thread-omar",
        title: null,
        isGroup: false,
        createdAt: isoHoursFromNow(-20),
        participants: uniqueUsers([currentUser, studentThree]),
        lastMessagePreview: "I uploaded the updated notes for the lab demo.",
      },
    ],
    announcements: [
      {
        id: "announcement-open-studio",
        departmentId: "dept-design",
        title: "Open studio review starts at 3:30 PM",
        body: "Bring one polished frame, one rough sketch, and one question you want feedback on.",
        pinned: true,
        createdAt: isoHoursFromNow(-2),
        author: teacher,
      },
      {
        id: "announcement-lobby",
        departmentId: "dept-lobby",
        title: "Friday assembly moved to the auditorium",
        body: "The robotics showcase now follows the assembly instead of happening before lunch.",
        pinned: true,
        createdAt: isoHoursFromNow(-5),
        author: currentUser.role === "admin" ? admin : teacher,
      },
      {
        id: "announcement-science",
        departmentId: "dept-science",
        title: "Peer tutoring board is open for this week",
        body: "If you need help with the microscopy report, claim a help slot by tonight.",
        pinned: false,
        createdAt: isoHoursFromNow(-8),
        author: studentTwo,
      },
    ],
    resources: [
      {
        id: "resource-design-rubric",
        departmentId: "dept-design",
        title: "Critique rubric",
        body: "Use this checklist before final upload so peer feedback stays focused.",
        linkUrl: null,
        createdAt: isoHoursFromNow(-4),
        attachment: {
          bucket: "preview",
          path: "design/rubric.pdf",
          filename: "critique-rubric.pdf",
          mimeType: "application/pdf",
          size: 1048576,
        },
        author: teacher,
      },
      {
        id: "resource-science-guide",
        departmentId: "dept-science",
        title: "Microscope reference sheet",
        body: "Quick guide for slide setup, focus adjustment, and observation notes.",
        linkUrl: "https://schoolhub.edu/resources/microscope-reference",
        createdAt: isoHoursFromNow(-9),
        attachment: null,
        author: studentThree,
      },
      {
        id: "resource-lobby-calendar",
        departmentId: "dept-lobby",
        title: "Campus calendar",
        body: "This week includes the showcase, assembly, and help-hour windows.",
        linkUrl: "https://schoolhub.edu/calendar",
        createdAt: isoHoursFromNow(-12),
        attachment: null,
        author: teacher,
      },
    ],
    messages: [
      {
        id: "message-lobby-1",
        body: "Morning everyone. Advisory leads can drop their huddle links here before first period.",
        departmentId: "dept-lobby",
        directThreadId: null,
        parentMessageId: null,
        kind: "message",
        createdAt: isoHoursFromNow(-6),
        updatedAt: isoHoursFromNow(-6),
        attachment: null,
        author: teacher,
        reactions: [{ emoji: "👍", userId: "user-jai" }],
      },
      {
        id: "message-design-1",
        body: "Please pin your final concept board and keep process notes in the thread so everyone can track your iterations.",
        departmentId: "dept-design",
        directThreadId: null,
        parentMessageId: null,
        kind: "message",
        createdAt: isoHoursFromNow(-3),
        updatedAt: isoHoursFromNow(-3),
        attachment: null,
        author: teacher,
        reactions: [
          { emoji: "👍", userId: "user-jai" },
          { emoji: "🎯", userId: "user-mila" },
        ],
      },
      {
        id: "message-design-2",
        body: "I can volunteer to review typography passes after lunch if anyone wants a second set of eyes.",
        departmentId: "dept-design",
        directThreadId: null,
        parentMessageId: null,
        kind: "message",
        createdAt: isoHoursFromNow(-2),
        updatedAt: isoHoursFromNow(-2),
        attachment: null,
        author: studentOne,
        reactions: [{ emoji: "❤", userId: "user-anna" }],
      },
      {
        id: "message-design-3",
        body: "Shared the moodboard and references for the exhibition panel layout.",
        departmentId: "dept-design",
        directThreadId: null,
        parentMessageId: "message-design-1",
        kind: "file",
        createdAt: isoHoursFromNow(-1),
        updatedAt: isoHoursFromNow(-1),
        attachment: {
          bucket: "preview",
          path: "design/exhibition-board.fig",
          filename: "exhibition-board.fig",
          mimeType: "application/octet-stream",
          size: 2621440,
        },
        author: studentTwo,
        reactions: [{ emoji: "🎯", userId: "user-anna" }],
      },
      {
        id: "message-science-1",
        body: "Lab bench B is free for anyone who still needs to redo the staining pass before tomorrow.",
        departmentId: "dept-science",
        directThreadId: null,
        parentMessageId: null,
        kind: "message",
        createdAt: isoMinutesFromNow(-90),
        updatedAt: isoMinutesFromNow(-90),
        attachment: null,
        author: studentThree,
        reactions: [{ emoji: "👍", userId: "user-mila" }],
      },
      {
        id: "message-thread-1",
        body: "Can we pin the review rubric before the critique?",
        departmentId: null,
        directThreadId: "thread-mentors",
        parentMessageId: null,
        kind: "message",
        createdAt: isoMinutesFromNow(-45),
        updatedAt: isoMinutesFromNow(-45),
        attachment: null,
        author: studentOne,
        reactions: [{ emoji: "👍", userId: "user-anna" }],
      },
      {
        id: "message-thread-2",
        body: "Already done. It is in the resources stack and at the top of the room panel.",
        departmentId: null,
        directThreadId: "thread-mentors",
        parentMessageId: null,
        kind: "message",
        createdAt: isoMinutesFromNow(-30),
        updatedAt: isoMinutesFromNow(-30),
        attachment: null,
        author: currentUser.role === "student" ? teacher : currentUser,
        reactions: [],
      },
    ],
    assignments: [
      {
        id: "assignment-design",
        departmentId: "dept-design",
        title: "Spatial aptitude board",
        instructions: "Upload a polished concept board with one annotated sketch, one refined composition, and a short reflection on your design choices.",
        dueAt: isoHoursFromNow(16),
        points: 40,
        status: "open",
        attachment: null,
        createdAt: isoHoursFromNow(-5),
        author: teacher,
        submissions: [
          {
            id: "submission-jai",
            assignmentId: "assignment-design",
            studentId: "user-jai",
            body: "Uploaded the second pass with stronger spacing and clearer captions.",
            attachment: {
              bucket: "preview",
              path: "submissions/jai-spatial-board.pdf",
              filename: "jai-spatial-board.pdf",
              mimeType: "application/pdf",
              size: 1966080,
            },
            status: "submitted",
            score: null,
            feedback: null,
            submittedAt: isoHoursFromNow(-1),
            gradedAt: null,
            student: studentOne,
          },
        ],
      },
      {
        id: "assignment-science",
        departmentId: "dept-science",
        title: "Microscope reflection",
        instructions: "Submit a short lab note with three observations, one question, and one image or sketch of the sample.",
        dueAt: isoHoursFromNow(30),
        points: 30,
        status: "open",
        attachment: null,
        createdAt: isoHoursFromNow(-8),
        author: teacher,
        submissions: [],
      },
    ],
    helpRequests: [
      {
        id: "help-typography",
        departmentId: "dept-design",
        title: "Need feedback on typography hierarchy",
        description: "I am close on the layout but the headline and caption balance still feels off on mobile.",
        topicTags: ["design", "typography"],
        status: "matched",
        pointsReward: 15,
        createdAt: isoHoursFromNow(-3),
        resolvedAt: null,
        author: studentOne,
        volunteer: studentTwo,
      },
      {
        id: "help-lab",
        departmentId: "dept-science",
        title: "Can someone review my slide labels?",
        description: "I want a quick check before I submit the microscopy reflection tomorrow morning.",
        topicTags: ["biology", "lab"],
        status: "open",
        pointsReward: 20,
        createdAt: isoHoursFromNow(-2),
        resolvedAt: null,
        author: studentThree,
        volunteer: null,
      },
    ],
    badges: [
      {
        id: "badge-first-match",
        slug: "first-match",
        name: "First Match",
        description: "Volunteered for a help request and kept the loop moving.",
        icon: "Spark",
        pointsThreshold: 15,
        awardedAt: isoHoursFromNow(-20),
      },
      {
        id: "badge-community-builder",
        slug: "community-builder",
        name: "Community Builder",
        description: "Crossed 100 collaboration points through support and shared resources.",
        icon: "Crown",
        pointsThreshold: 100,
        awardedAt: isoHoursFromNow(-10),
      },
    ],
    notifications: [
      {
        id: "notification-critique",
        kind: "assignment_due",
        title: "Spatial aptitude board due tomorrow",
        body: "The Design Lab critique board closes in 16 hours.",
        departmentId: "dept-design",
        assignmentId: "assignment-design",
        helpRequestId: null,
        messageId: null,
        directThreadId: null,
        isRead: false,
        createdAt: isoMinutesFromNow(-25),
      },
      {
        id: "notification-help",
        kind: "help_matched",
        title: "Mila volunteered on a help request",
        body: "The typography hierarchy request has a volunteer and is ready for review.",
        departmentId: "dept-design",
        assignmentId: null,
        helpRequestId: "help-typography",
        messageId: null,
        directThreadId: null,
        isRead: false,
        createdAt: isoMinutesFromNow(-50),
      },
      {
        id: "notification-badge",
        kind: "badge_unlocked",
        title: "New badge unlocked",
        body: "Community Builder was awarded for sustained collaboration.",
        departmentId: null,
        assignmentId: null,
        helpRequestId: null,
        messageId: null,
        directThreadId: null,
        isRead: true,
        createdAt: isoHoursFromNow(-9),
      },
    ],
    directory: [
      { departmentId: "dept-lobby", role: "teacher", user: teacher },
      { departmentId: "dept-lobby", role: "member", user: studentOne },
      { departmentId: "dept-lobby", role: "member", user: studentTwo },
      { departmentId: "dept-design", role: "teacher", user: teacher },
      { departmentId: "dept-design", role: "member", user: studentOne },
      { departmentId: "dept-design", role: "member", user: studentTwo },
      { departmentId: "dept-science", role: "teacher", user: teacher },
      { departmentId: "dept-science", role: "member", user: studentTwo },
      { departmentId: "dept-science", role: "member", user: studentThree },
      ...(currentUser.role === "admin"
        ? [
            { departmentId: "dept-lobby", role: "admin" as const, user: admin },
            { departmentId: "dept-design", role: "admin" as const, user: admin },
            { departmentId: "dept-science", role: "admin" as const, user: admin },
          ]
        : []),
    ],
  };
}
