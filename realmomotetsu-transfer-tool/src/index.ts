import dotenv from "dotenv";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

// 旧環境Supabaseクライアント
const supabaseV1: SupabaseClient = createClient(process.env.SUPABASE_URL_V1!, process.env.SUPABASE_ANON_KEY_V1!);

// 新環境Supabaseクライアント
const supabaseV2: SupabaseClient = createClient(process.env.SUPABASE_URL_V2!, process.env.SUPABASE_ANON_KEY_V2!);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        await transferTeams();
        await transferPoints();
        await transferGoalStations();
        await transferTransitStations();
        await transferBombiiHistory();
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Lambda is working!" }),
        };
    } catch (error) {
        console.log("Error during data transfer:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error", error }),
        };
    }
};

/**
 * V2.teams⇒V1.teams
 */
const transferTeams = async () => {
    const { data: teams, error } = await supabaseV2.from("teams").select("*").eq("event_code", "TOKYU_V2_20251115");
    if (error) {
        throw error;
    }
    for (const team of teams) {
        switch (team.team_code) {
            case "TOKYU_V2_20251115_TEAM_A":
                const { data: dataA, error: errorA } = await supabaseV1
                    .from("teams")
                    .update({
                        team_name: team.team_name,
                    })
                    .eq("team_id", "teamA")
                    .select();
                if (errorA) {
                    throw errorA;
                }
                break;
            case "TOKYU_V2_20251115_TEAM_B":
                const { data: dataB, error: errorB } = await supabaseV1
                    .from("teams")
                    .update({
                        team_name: team.team_name,
                    })
                    .eq("team_id", "teamB")
                    .select();
                if (errorB) {
                    throw errorB;
                }
                break;
            case "TOKYU_V2_20251115_TEAM_C":
                const { data: dataC, error: errorC } = await supabaseV1
                    .from("teams")
                    .update({
                        team_name: team.team_name,
                    })
                    .eq("team_id", "teamC")
                    .select();
                if (errorC) {
                    throw errorC;
                }
                break;
            case "TOKYU_V2_20251115_TEAM_D":
                const { data: dataD, error: errorD } = await supabaseV1
                    .from("teams")
                    .update({
                        team_name: team.team_name,
                    })
                    .eq("team_id", "teamD")
                    .select();
                if (errorD) {
                    throw errorD;
                }
                break;
            default:
                break;
        }
    }
};

/**
 * V2.points⇒V1.points
 */
const transferPoints = async () => {
    const { data: points, error } = await supabaseV2.from("points").select("*").eq("event_code", "TOKYU_V2_20251115");
    if (error) {
        throw error;
    }

    const { error: deleteError } = await supabaseV1.from("points").delete().neq("point_id", 0);
    if (deleteError) {
        throw deleteError;
    }

    for (const point of points) {
        switch (point.team_code) {
            case "TOKYU_V2_20251115_TEAM_A":
                const { data: dataA, error: errorA } = await supabaseV1
                    .from("points")
                    .insert({
                        team_id: "teamA",
                        point: point.points,
                        is_charged: point.status === "scored" ? true : false,
                        created_at: point.created_at,
                        updated_at: point.updated_at,
                    })
                    .select();
                if (errorA) {
                    throw errorA;
                }
                break;
            case "TOKYU_V2_20251115_TEAM_B":
                const { data: dataB, error: errorB } = await supabaseV1
                    .from("points")
                    .insert({
                        team_id: "teamB",
                        point: point.points,
                        is_charged: point.status === "scored" ? true : false,
                        created_at: point.created_at,
                        updated_at: point.updated_at,
                    })
                    .select();
                if (errorB) {
                    throw errorB;
                }
                break;
            case "TOKYU_V2_20251115_TEAM_C":
                const { data: dataC, error: errorC } = await supabaseV1
                    .from("points")
                    .insert({
                        team_id: "teamC",
                        point: point.points,
                        is_charged: point.status === "scored" ? true : false,
                        created_at: point.created_at,
                        updated_at: point.updated_at,
                    })
                    .select();
                if (errorC) {
                    throw errorC;
                }
                break;
            case "TOKYU_V2_20251115_TEAM_D":
                const { data: dataD, error: errorD } = await supabaseV1
                    .from("points")
                    .insert({
                        team_id: "teamD",
                        point: point.points,
                        is_charged: point.status === "scored" ? true : false,
                        created_at: point.created_at,
                        updated_at: point.updated_at,
                    })
                    .select();
                if (errorD) {
                    throw errorD;
                }
                break;
            default:
                break;
        }
    }
};

/**
 * V2.goal_stations⇒V1.goal_stations
 */
const transferGoalStations = async () => {
    const { data: goalStations, error } = await supabaseV2
        .from("goal_stations")
        .select("*")
        .eq("event_code", "TOKYU_V2_20251115");
    if (error) {
        throw error;
    }

    const { error: deleteError } = await supabaseV1.from("goal_stations").delete().neq("goal_station_id", 0);
    if (deleteError) {
        throw deleteError;
    }

    for (const goalStation of goalStations) {
        const stationId = goalStation.station_code.replace("TOKYU_V2_", "");

        const { data, error } = await supabaseV1
            .from("goal_stations")
            .insert({
                station_id: stationId,
                created_at: goalStation.created_at,
                updated_at: goalStation.updated_at,
            })
            .select();
        if (error) {
            throw error;
        }
    }
};

/**
 * V2.transit_stations⇒V1.transit_stations
 */
const transferTransitStations = async () => {
    const { data: transitStations, error } = await supabaseV2
        .from("transit_stations")
        .select("*")
        .eq("event_code", "TOKYU_V2_20251115");
    if (error) {
        throw error;
    }

    const { error: deleteError } = await supabaseV1.from("transit_stations").delete().neq("transit_station_id", 0);
    if (deleteError) {
        throw deleteError;
    }

    for (const transitStation of transitStations) {
        const stationId = transitStation.station_code.replace("TOKYU_V2_", "");

        switch (transitStation.team_code) {
            case "TOKYU_V2_20251115_TEAM_A":
                const { data: dataA, error: errorA } = await supabaseV1
                    .from("transit_stations")
                    .insert({
                        team_id: "teamA",
                        station_id: stationId,
                        created_at: transitStation.created_at,
                        updated_at: transitStation.updated_at,
                    })
                    .select();
                if (errorA) {
                    throw errorA;
                }
                break;
            case "TOKYU_V2_20251115_TEAM_B":
                const { data: dataB, error: errorB } = await supabaseV1
                    .from("transit_stations")
                    .insert({
                        team_id: "teamB",
                        station_id: stationId,
                        created_at: transitStation.created_at,
                        updated_at: transitStation.updated_at,
                    })
                    .select();
                if (errorB) {
                    throw errorB;
                }
                break;
            case "TOKYU_V2_20251115_TEAM_C":
                const { data: dataC, error: errorC } = await supabaseV1
                    .from("transit_stations")
                    .insert({
                        team_id: "teamC",
                        station_id: stationId,
                        created_at: transitStation.created_at,
                        updated_at: transitStation.updated_at,
                    })
                    .select();
                if (errorC) {
                    throw errorC;
                }
                break;
            case "TOKYU_V2_20251115_TEAM_D":
                const { data: dataD, error: errorD } = await supabaseV1
                    .from("transit_stations")
                    .insert({
                        team_id: "teamD",
                        station_id: stationId,
                        created_at: transitStation.created_at,
                        updated_at: transitStation.updated_at,
                    })
                    .select();
                if (errorD) {
                    throw errorD;
                }
                break;
            default:
                break;
        }
    }
};

/**
 * V2.bombii_histories⇒V1.bombii_histories
 */
const transferBombiiHistory = async () => {
    const { data: bombiiHistories, error } = await supabaseV2
        .from("bombii_histories")
        .select("*")
        .eq("event_code", "TOKYU_V2_20251115");
    if (error) {
        throw error;
    }

    const { error: deleteError } = await supabaseV1.from("bombii_history").delete().neq("id", 0);
    if (deleteError) {
        throw deleteError;
    }
    for (const history of bombiiHistories) {
        switch (history.team_code) {
            case "TOKYU_V2_20251115_TEAM_A":
                const { data: dataA, error: errorA } = await supabaseV1
                    .from("bombii_history")
                    .insert({
                        team_id: "teamA",
                        created_at: history.created_at,
                        updated_at: history.updated_at,
                    })
                    .select();
                if (errorA) {
                    throw errorA;
                }
                break;
            case "TOKYU_V2_20251115_TEAM_B":
                const { data: dataB, error: errorB } = await supabaseV1
                    .from("bombii_history")
                    .insert({
                        team_id: "teamB",
                        created_at: history.created_at,
                        updated_at: history.updated_at,
                    })
                    .select();
                if (errorB) {
                    throw errorB;
                }
                break;
            case "TOKYU_V2_20251115_TEAM_C":
                const { data: dataC, error: errorC } = await supabaseV1
                    .from("bombii_history")
                    .insert({
                        team_id: "teamC",
                        created_at: history.created_at,
                        updated_at: history.updated_at,
                    })
                    .select();
                if (errorC) {
                    throw errorC;
                }
                break;
            case "TOKYU_V2_20251115_TEAM_D":
                const { data: dataD, error: errorD } = await supabaseV1
                    .from("bombii_history")
                    .insert({
                        team_id: "teamD",
                        created_at: history.created_at,
                        updated_at: history.updated_at,
                    })
                    .select();
                if (errorD) {
                    throw errorD;
                }
                break;
            default:
                break;
        }
    }
};
