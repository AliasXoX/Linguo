import { verifySession } from "@/lib/dal";
import { ListPanelWrapper } from "./ListPanelWrapper";
import { getListWords } from "@/app/actions/words";


export default async function Learn() {
  const session = await verifySession();

  const mode = "pinyin"; // or "fr", this should be determined by user selection
  const userId = Number(session?.userId) || 0;

  const listWordsResult = await getListWords(userId);
  const listWords = listWordsResult.words || [];
  const total = listWords.length ? listWords.length : 0

  console.log("listWordsResult:", listWordsResult);

  const listCh = listWords.map(word => { return { word: word.ch , id: word.id } });
  const listFr = listWords.map(word => { return { word: word.fr , id: word.id } });

  const initBoxes = [
    { rest: total , total: total, selected: true },
  ];

  return (
    <main className="flex-1 flex flex-col items-center justify-between px-1 md:px-56 pb-3">
        <div className="flex flex-1 w-full bg-[var(--color-neutral-lightest)]">
          <ListPanelWrapper
            initMode={mode}
            userId={userId}
            initBoxes={initBoxes}
            initWord={listWordsResult.success ? { word: mode === "pinyin" ? listCh[0].word : listFr[0].word, id: listWordsResult.success ? (mode === "pinyin" ? listCh[0].id : listFr[0].id) : 0 } : { word: "", id: 0 }}
            listCh={listCh}
            listFr={listFr}
            total={total}
            listWords={listWords}
          />
        </div>
    </main>
  );
}
