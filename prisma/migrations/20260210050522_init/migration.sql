-- CreateTable
CREATE TABLE "productos" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_productos_nombre" ON "productos"("nombre");

-- CreateIndex
CREATE INDEX "idx_productos_created_at" ON "productos"("created_at");
