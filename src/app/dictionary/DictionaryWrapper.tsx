'use client';

import React, { useState } from 'react';
import { useFormState } from 'react-dom';
import { Dictionary } from '@/components/organisms/Dictionary/Dictionary';
import { getWordsByOrder, addWord, deleteWord, editWord, addWordToList, removeWordFromList } from '../actions/words';

interface DictionaryWrapperProps {
    userId: number;
    initOrder: string;
    initWords?: Array<{
        id: number;
        ch: string;
        pinyin: string;
        fr: string;
        list: boolean;
    }>;
    wordsCount: number;
}

export function DictionaryWrapper({
    userId,
    initOrder,
    initWords,
    wordsCount
}: DictionaryWrapperProps) {

    const [words, setWords] = useState(initWords || []);
    const [page, setPage] = useState(0);

    const [order, setOrder] = useState(initOrder);

    const handleChangeOrder = () => {
        const newOrder = order === 'pinyin' ? 'fr' : 'pinyin';
        setOrder(newOrder);
        // When changing the order, we should reset to the first page
        setPage(0);
        getWordsByOrder(userId, newOrder, 0, 100).then(result => {
            if (result.success) {
                setWords(result.words as Array<{ id: number; ch: string; pinyin: string; fr: string; list: boolean }>);
            }
        });
    }

    const handleList = async (id: number, addToList: boolean) => {
        if (addToList) {
            const result = await addWordToList(userId, id);
            if (result.success) {
                // Update the word's list status in the local state
                setWords(prevWords => prevWords.map(word => word.id === id ? { ...word, list: true } : word));
            }
        } else {
            const result = await removeWordFromList(userId, id);
            if (result.success) {
                // Update the word's list status in the local state
                setWords(prevWords => prevWords.map(word => word.id === id ? { ...word, list: false } : word));
            }
        }
    }

    async function submitAddAction (
        prevState: { success: boolean; error?: string } | null,
        formData: FormData
    ) {
        const result = await addWord(userId, formData);
        if (result.success) {
            // After adding the word, we should refresh the page to show the new word in the dictionary
            const refreshResult = await getWordsByOrder(userId, order, page * 100, 100);
            if (refreshResult.success) {
                setWords(refreshResult.words as Array<{ id: number; ch: string; pinyin: string; fr: string; list: boolean }>);
            }
        }
        return result;
    }
    const [addFormState, addFormAction] = useFormState(submitAddAction, null);

    async function submitEditAction (
        prevState: { success: boolean; error?: string } | null,
        formData: FormData
    ) {
        const ch = formData.get("ch") as string;
        const pinyin = formData.get("pinyin") as string;
        const fr = formData.get("fr") as string;
        const idValue = formData.get("id");
        const id = typeof idValue === 'string' ? Number(idValue) : NaN;

        if (Number.isNaN(id)) {
            return { success: false, error: 'Invalid word id' };
        }
    
        const result = await editWord(userId, id, ch, pinyin, fr);
        if (result.success) {
            // After editing the word, we should refresh the page to show the updated word in the dictionary
            const refreshResult = await getWordsByOrder(userId, order, page * 100, 100);
            if (refreshResult.success) {
                setWords(refreshResult.words as Array<{ id: number; ch: string; pinyin: string; fr: string; list: boolean }>);
            }
        }
        return result;
    }
    const [editFormState, editFormAction] = useFormState(submitEditAction, null);

    async function handleDeleteAction(id: number) {
        const result = await deleteWord(userId, id);
        if (result.success) {
            // After deleting the word, we should refresh the page to remove the deleted word from the dictionary
            const refreshResult = await getWordsByOrder(userId, order, page * 100, 100);
            if (refreshResult.success) {
                setWords(refreshResult.words as Array<{ id: number; ch: string; pinyin: string; fr: string; list: boolean }>);
            }
        }
        return result;
    }

    async function handleNextPage() {
        const nextPage = page + 1;
        const result = await getWordsByOrder(userId, order, nextPage * 100, 100);
        if (result.success) {
            setWords(result.words as Array<{ id: number; ch: string; pinyin: string; fr: string; list: boolean }>);
            setPage(nextPage);
        }
    }
    const disableNext = (page + 1) * 100 >= wordsCount;

    async function handlePrevPage() {
        const nextPage = Math.max(0, page - 1);
        const result = await getWordsByOrder(userId, order, nextPage * 100, 100);
        if (result.success) {
            setWords(result.words as Array<{ id: number; ch: string; pinyin: string; fr: string; list: boolean }>);
            setPage(nextPage);
        }
    }
    const disablePrev = page === 0;

    return (
    <main className="flex-1 flex-col items-center justify-between px-1 md:px-56">
        <Dictionary
            words={words}
            page={page}
            nextPage={handleNextPage}
            prevPage={handlePrevPage}
            disableNext={disableNext}
            disablePrev={disablePrev}
            editAction={editFormAction}
            deleteAction={handleDeleteAction}
            addAction={addFormAction}
            onChangeOrder={handleChangeOrder}
            handleList={handleList}
        />
    </main>
    );
}