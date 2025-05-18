import { atom, useAtom } from "jotai";
import { useEffect } from "react";
import AliceInOnederland from "./AliceInOnederland";
import { FaAngleLeft, FaAngleRight, FaCircle } from "react-icons/fa6";
import SoundTrackDisc from "./SoundTrackDisc";

const pictures = [
    //"bg1",
    "m1",
    "redqueen_invite",
    //"bg2",
    "m2",
    "follow_white_rabbit",
    //"bg3",
    "m3",
    "tea_and_time",
    //"bg4",
    "m4",
    "theme_color_attire",
    //"bg5",
    "m5",
    "god_parents",
    //"bg6",
    "m6",
    "locations",
    "m7",
    "m8",
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
                <div className="w-full pointer-events-auto px-6 py-4 flex items-center justify-between">
                    <a className="cursor-pointer flex items-center justify-center">
                        <AliceInOnederland />
                    </a>
                    <SoundTrackDisc />
                </div>
                <div className="w-full overflow-auto pointer-events-auto flex justify-center">
                    <div className="overflow-auto flex items-center justify-between gap-2 max-w-full py-4">
                        {[...pages].map((_, index) => {
                            let button;

                            if (index === 0) {
                                button = <FaAngleLeft />;
                            } else if (index !== pages.length - 1) {
                                button = <FaCircle />;
                            } else {
                                button = <FaAngleRight />;
                            }

                            return (
                                <button
                                    key={index}
                                    className={`border-transparent hover:border-white transition-all duration-300 p-2 rounded-full text-lg uppercase shrink-0 border ${index === page ? "bg-white/90 text-black" : "bg-black/30 text-white"}`}
                                    onClick={() => setPage(index)}
                                >
                                    { button }
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