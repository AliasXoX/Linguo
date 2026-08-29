'use client';

import React from 'react';
import { useState } from 'react';
import { useFormState } from 'react-dom';
import { LearnPanel } from '@/components/organisms/LearnPanel/LearnPanel';
import { submitAnswer, getBoxCount, getWord } from '@/app/actions/words';

interface ListPanelWrapperProps {
  initMode: string;
  userId: number;
  initBoxes: Array<{
    rest: number;
    total: number;
  }>;
  initWord: { word: string; id: number};
  listCh: Array<{ word: string; id: number }>;
  listFr: Array<{ word: string; id: number }>;
  total: number;
  listWords?: Array<any>;
}

export function ListPanelWrapper({ initMode, userId, initBoxes, initWord, listCh, listFr, total, listWords }: ListPanelWrapperProps) {
  const [selectedBox, setSelectedBox] = useState(0);
  const [boxes, setBoxes] = useState(initBoxes);
  const [inputWord, setInputWord] = useState(initWord);
  const [update, setUpdate] = useState(true); // update box after submit if true
  const [listFrIndex, setListWordsIndex] = useState(0);
  const [listChIndex, setListChIndex] = useState(0);
  const [mode, setMode] = useState(initMode);
  const [visibleState, setVisibleState] = useState<{
      success: boolean;
      correct: boolean;
      error?: undefined;
    } | {
        success: boolean;
        error: string;
        correct?: undefined;
    } | null>(null);

  async function getNextWord(newMode: string) {
    if (newMode === "pinyin") {
      const nextIndex = listChIndex + 1;
      if (nextIndex < listCh.length) {
        setListChIndex(nextIndex);
      } else {
        setListChIndex(0);
      }
      const nextWord = listCh.length > 0 ? listCh[nextIndex] || listCh[0] : { word: "", id: 0 };
      setInputWord({ word: nextWord.word, id: nextWord.id });
    }
    if (newMode === "fr") {
      const nextIndex = listFrIndex + 1;
      if (nextIndex < listFr.length) {
        setListWordsIndex(nextIndex);
      } else {
        setListWordsIndex(0);
      }
      const nextWord = listFr.length > 0 ? listFr[nextIndex] || listFr[0] : { word: "", id: 0 };
      setInputWord({ word: nextWord.word, id: nextWord.id });
    }
  }


  async function handleChangeMode() {
    const newMode = mode === "pinyin" ? "fr" : "pinyin";
    setMode(newMode);
    setSelectedBox(0);
    await updateBoxes(newMode);
    if (newMode === "pinyin") {
      setInputWord({ word: listCh[listChIndex].word, id: listCh[listChIndex].id });
    } else {
      setInputWord({ word: listFr[listFrIndex].word, id: listFr[listFrIndex].id });
    }
  }

  async function updateBoxes(mode: string) {
    let rest = 0;
    if (mode === "pinyin") {
      rest = listCh.length;
    } else {
      rest = listFr.length;
    }
    const initBoxes = [
      { rest: rest, total: total, selected: true },
    ];
    setBoxes(initBoxes);
  }

  async function verifyAnswer(formData: FormData) {
    const unmode = mode === "fr" ? "ch" : "pinyin";
    const answer = (formData.get("answer") as string).toLowerCase();
    const index = mode === "pinyin" ? listChIndex : listFrIndex;
    const realAnswer = listWords?.find(word => word.id === inputWord.id)?.[unmode] || "";
    if (answer === realAnswer.toLowerCase()) {
        if (mode === "pinyin") {
            listCh.splice(listChIndex, 1);
        }
        if (mode === "fr") {
            listFr.splice(listFrIndex, 1);
        }
        await getNextWord(mode);
        await updateBoxes(mode);
        setVisibleState({ success: true, correct: true });
        return { success: true, correct: true };
    } else {
        setVisibleState({ success: true, correct: false });
        return { success: true, correct: false };
    }
  }

  async function handleSkip() {
    if (!inputWord) {
      return;
    }
    const index = mode === "pinyin" ? listChIndex : listFrIndex;
    const unmode = mode === "fr" ? "ch" : "pinyin";
    const realAnswer = listWords?.find(word => word.id === inputWord.id)?.[unmode] || "";
    return [realAnswer];
  }

  async function handleNext() {
    await getNextWord(mode);
    await updateBoxes(mode);
  }

  return (
    <LearnPanel
      boxes={boxes}
      mode={mode}
      handleChangeMode={handleChangeMode}
      selectedBox={selectedBox}
      setSelectedBox={(index: number) => {}}
      inputWord={{word: inputWord.word, id: inputWord.id, list: false}}
      formAction={verifyAnswer}
      state={visibleState}
      handleSkip={handleSkip}
      handleNext={handleNext}

    />
  );
}