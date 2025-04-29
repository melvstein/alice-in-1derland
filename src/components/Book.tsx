import { useCursor, useTexture } from "@react-three/drei"
import { pageAtom, pages } from "./UI";
import { JSX, useEffect, useMemo, useRef, useState } from "react";
import { useAtom } from "jotai";
import { Bone, BoxGeometry, Color, Float32BufferAttribute, MathUtils, Mesh, MeshStandardMaterial, Skeleton, SkinnedMesh, SRGBColorSpace, Uint16BufferAttribute, Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";

const easingFactor = 0.5;
const easingFactorFold = 0.3;
const insideCurveStrength = 0.18;
const outsideCurveStrength = 0.05;
const turningCurveStrength = 0.09;

const PAGE_WIDTH = 1.28;
const PAGE_HEIGHT = 1.71;
const PAGE_DEPTH = 0.003;
const PAGE_SEGMENTS = 35;
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;

const pageGeometry = new BoxGeometry(
    PAGE_WIDTH,
    PAGE_HEIGHT,
    PAGE_DEPTH,
    PAGE_SEGMENTS,
    2
);

pageGeometry.translate(PAGE_WIDTH / 2, 0, 0);

const position = pageGeometry.attributes.position;
const vertex = new Vector3();
const skinIndexes = [];
const skinWeights = [];

for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);
    const x = vertex.x;
    const skinIndex = Math.max(0, Math.floor(x / SEGMENT_WIDTH));
    let skinWeight = (x % SEGMENT_WIDTH) / SEGMENT_WIDTH;

    skinIndexes.push(skinIndex, skinIndex + 1, 0, 0);
    skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
}

pageGeometry.setAttribute(
    "skinIndex",
    new Uint16BufferAttribute(skinIndexes, 4)
);

pageGeometry.setAttribute(
    "skinWeight",
    new Float32BufferAttribute(skinWeights, 4)
);

const whiteColor = new Color("white");
const emissiveColor = new Color("black");

const pageMaterials = [
    new MeshStandardMaterial({ color: whiteColor }),
    new MeshStandardMaterial({ color: "#111" }),
    new MeshStandardMaterial({ color: whiteColor }),
    new MeshStandardMaterial({ color: whiteColor }),
];

pages.forEach((page) => {
    useTexture.preload(`/assets/textures/${page.front}.jpg`);
    useTexture.preload(`/assets/textures/${page.back}.jpg`);
    // useTexture.preload(`/assets/textures/book-cover-roughness.jpg`);
});

type TPage = {
    number: number;
    front: number | string;
    back: number | string;
    page: number;
    opened: boolean;
    bookClosed: boolean;
}

type PageProps = TPage & JSX.IntrinsicElements['group'];

const Page = ({ number, front, back, page, opened, bookClosed, ...props } : PageProps) => {
    /* const [picture, picture2, pictureRoughness] = useTexture([
        `/assets/textures/${front}.jpg`,
        `/assets/textures/${back}.jpg`,
        ...(number === 0 || number === pages.length - 1
            ? [`/assets/textures/book-cover-roughness.jpg`]
            : [])
    ]); */

    const [picture, picture2] = useTexture([
        `/assets/textures/${front}.jpg`,
        `/assets/textures/${back}.jpg`
    ]);

    picture.colorSpace = picture2.colorSpace = SRGBColorSpace;
    const group = useRef<Mesh | null>(null);
    const turnedAt = useRef(0);
    const lastOpened = useRef(opened);
    const skinnedMeshRef = useRef<SkinnedMesh | null>(null);
    const manualSkinnedMesh = useMemo(() => {
        const bones = [];

        for (let i = 0; i <= PAGE_SEGMENTS; i++) {
            let bone = new Bone();
            bones.push(bone);

            if (i === 0) {
                bone.position.x = 0;
            } else {
                bone.position.x = SEGMENT_WIDTH;
            }

            if (i > 0) {
                bones[i - 1].add(bone);
            }
        }

        const skeleton = new Skeleton(bones);

        const materials = [
            ...pageMaterials,
            new MeshStandardMaterial({
                color: whiteColor,
                map: picture,
                roughness: 0.1,
                emissive: emissiveColor,
                emissiveIntensity: 0,
            }),
            new MeshStandardMaterial({
                color: whiteColor,
                map: picture2,
                roughness: 0.1,
                emissive: emissiveColor,
                emissiveIntensity: 0,
            }),
        ];

        const mesh = new SkinnedMesh(pageGeometry, materials);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.frustumCulled = false;
        mesh.add(skeleton.bones[0]);
        mesh.bind(skeleton);
        return mesh;
    }, []);

    const [highlighted, setHighlighted] = useState(false);

    useFrame((_, delta) => {
        if (!skinnedMeshRef.current) {
            return;
        }

        const emissiveIntensity = highlighted ? 0.22 : 0;
        const skinnedMeshRefMaterials = skinnedMeshRef.current.material as MeshStandardMaterial[];

        skinnedMeshRefMaterials[4].emissiveIntensity = skinnedMeshRefMaterials[5].emissiveIntensity = MathUtils.lerp(
            skinnedMeshRefMaterials[4].emissiveIntensity,
        emissiveIntensity,
        0.1
        );
            
        if (lastOpened.current !== opened) {
            turnedAt.current = +new Date();
            lastOpened.current = opened;
        }

        let turningTime = Math.min(400, +new Date() - turnedAt.current) / 400;
        turningTime = Math.sin(turningTime * Math.PI);

        let targetRotation = opened ? -Math.PI / 2 : Math.PI / 2;

        if (!bookClosed) {
            targetRotation += MathUtils.degToRad(number * 0.8);
        }

        const bones = skinnedMeshRef.current.skeleton.bones;

        for (let i = 0; i < bones.length; i++) {
            const target = i === 0 ? group.current : bones[i];
            const insideCurveIntensity = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0;
            const outsideCurveIntensity = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0;
            const turningIntensity = Math.sin(i * Math.PI * (1 / bones.length)) * turningTime;
            let rotationAngle =
                insideCurveStrength * insideCurveIntensity * targetRotation -
                outsideCurveStrength * outsideCurveIntensity * targetRotation +
                turningCurveStrength * turningIntensity * targetRotation;
            let foldRotationAngle = MathUtils.degToRad(Math.sign(targetRotation) * 2);
            
            if (bookClosed) {
                if (i === 0) {
                    rotationAngle = targetRotation;
                    foldRotationAngle = 0;
                } else {
                    rotationAngle = 0;
                    foldRotationAngle = 0;
                }
            }

            if (target) {
                easing.dampAngle(
                    target.rotation,
                    "y",
                    rotationAngle,
                    easingFactor,
                    delta
                );

                const foldIntensity = i > 8
                    ? Math.sin(i * Math.PI * (1 / bones.length) - 0.5) * turningTime
                    : 0;
                
                easing.dampAngle(
                    target.rotation,
                    "x",
                    foldRotationAngle * foldIntensity,
                    easingFactorFold,
                    delta
                );
            }
        }
    });

    const [_, setPage] = useAtom(pageAtom);
    useCursor(highlighted);

    return (
        <group
            {...props}
            ref={group}
            onPointerEnter={(e)=> {
                e.stopPropagation();
                setHighlighted(true);
            }}
            onPointerLeave={(e) => {
                e.stopPropagation();
                setHighlighted(false);
            }}
            onClick={(e) => {
                e.stopPropagation();
                setPage(opened ? number : number + 1);
                setHighlighted(false);
            }}
        >
            <primitive
                object={ manualSkinnedMesh }
                ref={ skinnedMeshRef }
                position-z={ -number * PAGE_DEPTH + page * PAGE_DEPTH }
            />
        </group>
      )
}

export const Book = ({ ...props }) => {
    const [page] = useAtom(pageAtom);
    const [delayedPage, setDelayedPage] = useState<number>(page);

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;

        const goToPage = () => {
            setDelayedPage((delayedPage) => {
                if (page === delayedPage) {
                    return delayedPage;
                } else {
                    timeout = setTimeout(
                        () => {
                            goToPage();
                        },
                        Math.abs(page - delayedPage) > 2 ? 50 : 150,
                    );

                    if (page > delayedPage) {
                        return delayedPage + 1;
                    }

                    if (page < delayedPage) {
                        return delayedPage - 1;
                    }

                    return 0;
                }
            });
        };

        goToPage();

        return () => {
            clearTimeout(timeout);
        };
    }, [page]);

    return (
        <group {...props} rotation-y={-Math.PI / 2} position-x={-PAGE_WIDTH / 2}>
            {[...pages].map((pageData, index) => {
                console.log(pageData);
                return (
                    <Page
                    key={ index }
                    page={ delayedPage }
                    number={ index }
                    opened={ delayedPage > index }
                    bookClosed={ delayedPage === 0 || delayedPage === pages.length }
                    {...pageData}
                />
                )
            })}
        </group>
    )
}