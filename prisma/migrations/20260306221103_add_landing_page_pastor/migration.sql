-- CreateTable
CREATE TABLE "landing_page_pastor" (
    "id" SERIAL NOT NULL,
    "matrix_id" INTEGER NOT NULL,
    "member_id" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "descriptions" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_page_pastor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "landing_page_pastor_matrix_id_idx" ON "landing_page_pastor"("matrix_id");

-- CreateIndex
CREATE INDEX "landing_page_pastor_member_id_idx" ON "landing_page_pastor"("member_id");

-- CreateIndex
CREATE INDEX "landing_page_pastor_order_idx" ON "landing_page_pastor"("order");

-- CreateIndex
CREATE UNIQUE INDEX "landing_page_pastor_matrix_id_member_id_key" ON "landing_page_pastor"("matrix_id", "member_id");

-- AddForeignKey
ALTER TABLE "landing_page_pastor" ADD CONSTRAINT "landing_page_pastor_matrix_id_fkey" FOREIGN KEY ("matrix_id") REFERENCES "matrix"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "landing_page_pastor" ADD CONSTRAINT "landing_page_pastor_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
