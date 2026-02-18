-- CreateTable
CREATE TABLE "MemberSocialMedia" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,
    "instagram" TEXT,
    "facebook" TEXT,
    "twitter" TEXT,
    "whatsapp" TEXT,
    "linkedin" TEXT,
    "tiktok" TEXT,
    "youtube" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberSocialMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialMediaOther" (
    "id" SERIAL NOT NULL,
    "memberSocialMediaId" INTEGER NOT NULL,
    "platform" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialMediaOther_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MemberSocialMedia_memberId_key" ON "MemberSocialMedia"("memberId");

-- CreateIndex
CREATE INDEX "MemberSocialMedia_memberId_idx" ON "MemberSocialMedia"("memberId");

-- CreateIndex
CREATE INDEX "SocialMediaOther_memberSocialMediaId_idx" ON "SocialMediaOther"("memberSocialMediaId");

-- AddForeignKey
ALTER TABLE "MemberSocialMedia" ADD CONSTRAINT "MemberSocialMedia_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMediaOther" ADD CONSTRAINT "SocialMediaOther_memberSocialMediaId_fkey" FOREIGN KEY ("memberSocialMediaId") REFERENCES "MemberSocialMedia"("id") ON DELETE CASCADE ON UPDATE CASCADE;
