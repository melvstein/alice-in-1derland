import { atom, useAtom } from "jotai";
import { useEffect } from "react";
import AliceInOnederland from "./AliceInOnederland";

const pictures = [
    "bg1",
    "redqueen_invite",
    "bg2",
    "bg3",
    "bg4",
    "tea_and_time",
    /*"DSC00680",
    "DSC00933",
    "DSC00966",
    "DSC00983", 
    "DSC01011",
    "DSC01040",
    "DSC01064",
    "DSC01071",
    "DSC01103",
    "DSC01145",
    "DSC01420",
    "DSC01461",
    "DSC01489",
    "DSC02031",
    "DSC02064",
    "DSC02069", */
];

export const pageAtom = atom(0);
export const pages = [
    {
        front: "book-cover-2",
        back: pictures[0],
    }
];

for (let i = 1; i < pictures.length - 1; i += 2) {
    pages.push({
        front: pictures[i % pictures.length],
        back: pictures[(i + 1) % pictures.length],
    });
}

pages.push({
    front: pictures[pictures.length - 1],
    back: "book-back-1",
});

export const UI = () => {
    const [page, setPage] = useAtom(pageAtom);

    useEffect(() => {
        const audio = new Audio("/assets/audios/page-flip-01a.mp3");
        audio.play();
    }, [page]);

    return (
        <>
            <main className="pointer-events-none select-none z-10 fixed inset-0 flex justify-between flex-col">
                <a className="pointer-events-auto p-4">
                    <AliceInOnederland />
                </a>
                <div className="w-full overflow-auto pointer-events-auto flex justify-center">
                    <div className="overflow-auto flex items-center justify-between gap-2 max-w-full py-4">
                        {[...pages].map((_, index) => {

                            return (
                                <button
                                    key={index}
                                    className={`border-transparent hover:border-white transition-all duration-300 px-4 py-3 rounded-full text-lg uppercase shrink-0 border ${index === page ? "bg-white/90 text-black" : "bg-black/30 text-white"}`}
                                    onClick={() => setPage(index)}
                                >
                                    { index === 0 ? "Cover" : `Page ${index}` }
                                </button>
                            )
                        })}
                        {/* <button
                            className={`border-transparent hover:border-white transition-all duration-300 px-4 py-3 rounded-full text-lg uppercase shrink-0 border ${page === pages.length ? "bg-white/90 text-black" : "bg-black/30 text-white"}`}
                            onClick={() => setPage(pages.length)}
                        >
                            Back Cover
                        </button> */}
                    </div>
                </div>
            </main>
        </>
    );
}

export default UI;