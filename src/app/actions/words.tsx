'use server';

import { db } from "@/lib/db"

type SubmitAnswerState = {
    success: boolean;
    correct: boolean;
    error?: undefined;
} | {
    success: boolean;
    error: string;
    correct?: undefined;
} | null;

export async function getWord(userId: number, id: number, mode: string) {
    const unmode = mode === "fr" ? "ch" : "pinyin";
    try {
        const result = await db.query(`SELECT * FROM words WHERE user_id = $1 AND id = $2`, [userId, id]);
        if (result.rows.length > 0) {
            return { success: true, word: result.rows[0][unmode] };
        } else {
            return { success: false, error: "Word not found" };
        }
    } catch (error) {
        console.error("Error fetching word:", error);
        return { success: false, error: "Failed to fetch word" };
    }
}

export async function submitAnswer(
    mode: string,
    userId: number,
    update: boolean,
    prevState: SubmitAnswerState,
    formData: FormData
) {
    // mode "fr" or "pinyin" : the first mode is fr to simplified chinese, the second mode is simplified chinese to pinyin
    const unmode = mode === "fr" ? "ch" : "pinyin";
    const fetchMode = mode === "fr" ? "fr" : "ch";
    const word = (formData.get("translate") as string).toLowerCase();
    const answer = (formData.get("answer") as string).toLowerCase();
    try {
        const result = await db.query(`SELECT * FROM words WHERE user_id = $1 AND ${fetchMode} = $2`, [userId, word]);
        if (result.rows.length > 0 && result.rows[0][unmode].toLowerCase() === answer) {
            // In case of successful answer, we should upgrade the box
            if (update) {
                await upgradeBox(userId, result.rows[0]['id'], mode);
            }
            return { success: true, correct: true };
        } else {
            // In case of wrong answer, we should downgrade the box to the first box (0)
            if (update) {
                await downgradeBox(userId, result.rows[0]['id'], mode);
            }
            return { success: true, correct: false };
        }
    } catch (error) {
        console.error("Error checking answer:", error);
        return { success: false, error: "Failed to check answer" };
    }
}

export async function addWord(userId: number, formData: FormData) {
    const ch = (formData.get("ch") as string).toLowerCase();
    const pinyin = (formData.get("pinyin") as string).toLowerCase();
    const fr = (formData.get("fr") as string).toLowerCase();

    const dateNow = new Date();

    try {
        await db.query(`INSERT INTO words (user_id, ch, fr, pinyin, box, date, box_pinyin, date_pinyin) VALUES ($1, $2, $3, $4, 0, $5, 0, $5)`, [userId, ch, fr, pinyin, dateNow]);
        return { success: true };
    } catch (error) {
        console.error("Error adding word:", error);
        return { success: false, error: "Failed to add word" };
    }
}

export async function deleteWord(userId: number, id: number) {
    try {
        await db.query(`DELETE FROM words WHERE user_id = $1 AND id = $2`, [userId, id]);
        return { success: true };
    } catch (error) {
        console.error("Error deleting word:", error);
        return { success: false, error: "Failed to delete word" };
    }
}

export async function editWord(userId: number, id: number, newCh: string, newPinyin: string, newFr: string) {
    newCh = newCh.toLowerCase();
    newFr = newFr.toLowerCase();
    newPinyin = newPinyin.toLowerCase();
    try {
        await db.query(`UPDATE words SET ch = $3, fr = $4, pinyin = $5 WHERE user_id = $1 AND id = $2`, [userId, id, newCh, newFr, newPinyin]);
        return { success: true };
    } catch (error) {
        console.error("Error editing word:", error);
        return { success: false, error: "Failed to edit word" };
    }
}

export async function getWordsByBox(userId: number, box: number, mode: string, limit: number = 1000) {
    const boxMode = mode === "fr" ? 'box' : 'box_pinyin';
    try {
        const result = await db.query(`SELECT * FROM words WHERE user_id = $1 AND ${boxMode} = $2 LIMIT $3`, [userId, box, limit]);
        return { success: true, words: result.rows };
    } catch (error) {
        console.error("Error fetching words by box:", error);
        return { success: false, error: "Failed to fetch words by box" };
    }
}

export async function getWordsByOrder(userId: number, order: string, skip: number = 0, limit: number = 1000) {
    const validOrders = ["pinyin", "fr"];
    if (!validOrders.includes(order)) {
        return { success: false, error: "Invalid order parameter" };
    }
    try {
        const result = await db.query(`SELECT id, ch, pinyin, fr FROM words WHERE user_id = $1 ORDER BY ${order} LIMIT $2 OFFSET $3`, [userId, limit, skip]);
        return { success: true, words: result.rows };
    } catch (error) {
        console.error("Error fetching words by order:", error);
        return { success: false, error: "Failed to fetch words by order" };
    }
}

export async function getNextWord(userId: number, box: number, mode: string, excludeWords: string[] = []) {
    const unmode = mode === "pinyin" ? "ch" : "fr";
    const boxMode = mode === "fr" ? 'box' : 'box_pinyin';
    const dateMode = boxMode === 'box' ? 'date' : 'date_pinyin';
    const dateNow = new Date();
    const daysLimitMap: Record<number, number> = {
        1: 1,
        2: 2,
        3: 7,
        4: 14,
        5: 30,
        6: 180,
    };
    const daysLimit = daysLimitMap[box] ?? 0;
    try {
        let result;
        if (excludeWords.length === 0) {
            result = await db.query(
                `SELECT * FROM words WHERE user_id = $1 AND ($3 - ${dateMode} >= ${daysLimit}) AND ${boxMode} = $2 ORDER BY RANDOM() LIMIT 1`,
                [userId, box, dateNow]
            );
        }
        else {
            result = await db.query(
                `SELECT * FROM words WHERE user_id = $1 AND ($3 - ${dateMode} >= ${daysLimit}) AND ${boxMode} = $2 AND ${unmode} NOT IN (${excludeWords.map((_, i) => `$${i + 4}`).join(", ")}) ORDER BY RANDOM() LIMIT 1`,
                [userId, box, dateNow, ...excludeWords]
            );
        }
        if (result.rows.length > 0) {
            return { success: true, word: result.rows[0][unmode], id: result.rows[0]['id'] };
        } else {
            return { success: true, word: '', id: null }; // No word found, return empty string and null id
        }
    } catch (error) {
        console.error("Error fetching next word:", error);
        return { success: false, error: "Failed to fetch next word" };
    }
}

export async function upgradeBox(userId: number, id: number, mode: string, maxBox: number = 6) {
    const dateNow = new Date();
    const boxMode = mode === "fr" ? 'box' : 'box_pinyin';
    const dateMode = boxMode === 'box' ? 'date' : 'date_pinyin';
    try {
        await db.query(`UPDATE words SET ${boxMode} = ${boxMode} + 1, ${dateMode} = $3 WHERE user_id = $1 AND id = $2 AND ${boxMode} < $4`, [userId, id, dateNow, maxBox]);
        return { success: true };
    } catch (error) {
        console.error("Error upgrading box:", error);
        return { success: false, error: "Failed to upgrade box" };
    }
}

export async function downgradeBox(userId: number, id: number, mode: string, minBox: number = 0) {
    const dateNow = new Date();
    const boxMode = mode === "fr" ? 'box' : 'box_pinyin';
    const dateMode = boxMode === 'box' ? 'date' : 'date_pinyin';
    try {
        await db.query(`UPDATE words SET ${boxMode} = 0, ${dateMode} = $3 WHERE user_id = $1 AND id = $2 AND ${boxMode} > $4`, [userId, id, dateNow, minBox]);
        return { success: true };
    } catch (error) {
        console.error("Error downgrading box:", error);
        return { success: false, error: "Failed to downgrade box" };
    }
}

export async function  getBoxCount(userId: number, box: number, mode: string) {
    const dateNow = new Date();
    const boxMode = mode === "fr" ? 'box' : 'box_pinyin';
    const dateMode = boxMode === 'box' ? 'date' : 'date_pinyin';
    const daysLimitMap: Record<number, number> = {
        1: 1,
        2: 2,
        3: 7,
        4: 14,
        5: 30,
        6: 180,
    };
    const daysLimit = daysLimitMap[box] ?? 0;
    try {
        const result = await db.query(`SELECT COUNT(*) as count FROM words WHERE user_id = $1 AND ${boxMode} = $2`, [userId, box]);
        const total = Number(result.rows[0].count);
        const restResult = await db.query(`SELECT COUNT(*) as count FROM words WHERE user_id = $1 AND ${boxMode} = $2 AND ($3 - ${dateMode} >= ${daysLimit})`, [userId, box, dateNow]);
        const rest = Number(restResult.rows[0].count);

        return { success: true, rest: rest, total: total };
    } catch (error) {
        console.error("Error fetching box count:", error);
        return { success: false, error: "Failed to fetch box count" };
    }
}

export async function getTotalWordsCount(userId: number) {
    try {
        const result = await db.query(`SELECT COUNT(*) as count FROM words WHERE user_id = $1`, [userId]);
        const total = Number(result.rows[0].count);
        return { success: true, total: total };
    } catch (error) {
        console.error("Error fetching total words count:", error);
        return { success: false, error: "Failed to fetch total words count" };
    }
}