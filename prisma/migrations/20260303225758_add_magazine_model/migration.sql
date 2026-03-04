-- CreateTable
CREATE TABLE "magazine" (
    "id" SERIAL NOT NULL,
    "matrix_id" INTEGER NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "week_start_date" TIMESTAMP(3) NOT NULL,
    "week_end_date" TIMESTAMP(3) NOT NULL,
    "uploaded_by_id" INTEGER NOT NULL,
    "thumbnail_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "magazine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "magazine_matrix_id_idx" ON "magazine"("matrix_id");

-- CreateIndex
CREATE INDEX "magazine_week_start_date_idx" ON "magazine"("week_start_date");

-- CreateIndex
CREATE INDEX "magazine_uploaded_by_id_idx" ON "magazine"("uploaded_by_id");

-- AddForeignKey
ALTER TABLE "magazine" ADD CONSTRAINT "magazine_matrix_id_fkey" FOREIGN KEY ("matrix_id") REFERENCES "matrix"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "magazine" ADD CONSTRAINT "magazine_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "member"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
