import { defineConfig } from '@trigger.dev/sdk'
import { prismaExtension } from '@trigger.dev/build/extensions/prisma'

export default defineConfig({
  project: 'proj_ewbheztekexsibcjjypz',
  maxDuration: 300,
  build: {
    extensions: [
      prismaExtension({
        mode: 'modern',
      }),
    ],
  },
})
