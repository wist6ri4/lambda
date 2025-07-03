import { Client } from "@notionhq/client";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { config } from "dotenv";

config();

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const MINUTES_DATABASE_ID: string = process.env.NOTION_DATABASE_MINUTES_ID ?? "";
const AGENDA_DATABASE_ID: string = process.env.NOTION_DATABASE_AGENDA_ID ?? "";

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        const body = JSON.parse(event.body || "{}");
        console.log(body);
        const minutesPageId = body?.data?.id;

        if (!minutesPageId) {
            throw new Error("ページIDが見つかりません");
        }

        const minutesPage = await notion.pages.retrieve({ page_id: minutesPageId });

        const projectRelation = (minutesPage as any).properties["プロジェクト"]?.relation;
        if (!projectRelation || projectRelation.length === 0) {
            throw new Error("プロジェクトが設定されていません");
        }

        const projectId = projectRelation[0].id;

        const response = await notion.databases.query({
            database_id: AGENDA_DATABASE_ID,
            filter: {
                or: [
                    {
                        and: [
                            {
                                property: "プロジェクト",
                                relation: {
                                    contains: projectId
                                }
                            },
                            {
                                property: "ステータス",
                                status: {
                                    equals: "未着手"
                                }
                            }
                        ]
                    },
                    {
                        and: [
                            {
                                property: "プロジェクト",
                                relation: {
                                    contains: projectId
                                }
                            },
                            {
                                property: "ステータス",
                                status: {
                                    equals: "進行中"
                                }
                            }
                        ]
                    },
                                        {
                        and: [
                            {
                                property: "プロジェクト",
                                relation: {
                                    contains: projectId
                                }
                            },
                            {
                                property: "ステータス",
                                status: {
                                    equals: "保留"
                                }
                            }
                        ]
                    },
                ]
            }
        });

        const agendasToUpdate = response.results;

        for (const agenda of agendasToUpdate) {
            const currentRelations = (agenda as any).properties["議事録"].relation || [];
            const isAlreadyLinked = currentRelations.some((r: any) => r.id === minutesPageId);
            if (isAlreadyLinked) continue;

            await notion.pages.update({
                page_id: agenda.id,
                properties: {
                    "議事録": {
                        relation: [
                            ...currentRelations,
                            { id: minutesPageId }
                        ],
                    },
                },
            });
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "アジェンダの更新が完了しました",
                updatedAgendasCount: agendasToUpdate.length
            }),
        }
    } catch (err: any) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "アジェンダの更新中にエラーが発生しました",
                error: err.message || "不明なエラー"
            }),
        }
    }
}



