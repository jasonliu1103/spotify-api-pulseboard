import { AiPlaylistRequestStatus } from "@prisma/client";
import { defaultPlaylistModel } from "@/lib/ai/models";
import { prisma } from "@/lib/db/prisma";

interface CreateAiPlaylistRequestInput {
  userId: string;
  prompt: string;
  model?: string;
}

export function createAiPlaylistRequest({
  userId,
  prompt,
  model = defaultPlaylistModel,
}: CreateAiPlaylistRequestInput) {
  return prisma.aiPlaylistRequest.create({
    data: {
      userId,
      prompt,
      model,
      status: AiPlaylistRequestStatus.PENDING,
    },
  });
}

export function completeAiPlaylistRequest(requestId: string) {
  return prisma.aiPlaylistRequest.update({
    where: { id: requestId },
    data: {
      status: AiPlaylistRequestStatus.SUCCEEDED,
      completedAt: new Date(),
    },
  });
}
