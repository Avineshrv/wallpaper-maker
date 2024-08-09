'use client'
import { Stage, Layer, Image } from 'react-konva';
import useImage from 'use-image';
import { useState, useRef, useEffect } from 'react';
import { MdFileDownload, MdUndo, MdRedo } from 'react-icons/md';
import ImageComponent from 'next/image';

const KonvaCanvas = () => {
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
    const [backgrounds] = useState(['/images/bg/bg1.jpg', '/images/bg/bg2.jpg', '/images/bg/bg3.jpg']);
    const [toys] = useState(['/images/character/image.png']);
    const [stickers, setStickers] = useState([
        { src: '/images/sticker/pow.png', positions: [] },
        { src: '/images/sticker/pow.png', positions: [] },
        { src: '/images/sticker/pow.png', positions: [] },
    ]);
    const [currentBackground, setCurrentBackground] = useState(backgrounds[0]);
    const [currentToy, setCurrentToy] = useState(toys[0]);
    const [selectedStickerIndex, setSelectedStickerIndex] = useState(null);
    const [backgroundImage] = useImage(currentBackground);
    const [toyImage] = useImage(currentToy);
    const stickerImages = stickers.map(sticker => useImage(sticker.src));
    const stageRef = useRef(null);
    const [history, setHistory] = useState([stickers]);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
      const updateSize = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      };
  
      updateSize(); 
  
      window.addEventListener("resize", updateSize);
      return () => window.removeEventListener("resize", updateSize);
    }, []);

    const handleBackgroundClick = (e) => {
        e.cancelBubble = true;
        const evt = e.evt;
        const stage = stageRef.current;
        const containerRect = stage.container().getBoundingClientRect();
        const isTouch = evt.type === 'touchend';
        const x = isTouch ? evt.changedTouches[0].clientX - containerRect.left : evt.layerX;
        const y = isTouch ? evt.changedTouches[0].clientY - containerRect.top : evt.layerY;

        if (selectedStickerIndex !== null) {
            const stickerImage = stickerImages[selectedStickerIndex][0];
            if (stickerImage) {
                const newX = x - stickerImage.width / 20;
                const newY = y - stickerImage.height / 20;
                const newStickers = stickers.map((sticker, index) => {
                    if (index === selectedStickerIndex) {
                        return { ...sticker, positions: [...sticker.positions, { x: newX, y: newY }] };
                    }
                    return sticker;
                });
                updateHistory(newStickers);
            }
        }
    };

    const handleDragEnd = (e, stickerIndex, positionIndex) => {
        const newPos = { x: e.target.x(), y: e.target.y() };
        const newStickers = stickers.map((sticker, sIdx) => {
            if (sIdx === stickerIndex) {
                const newPositions = sticker.positions.map((pos, pIdx) => {
                    if (pIdx === positionIndex) {
                        return newPos;
                    }
                    return pos;
                });
                return { ...sticker, positions: newPositions };
            }
            return sticker;
        });
        updateHistory(newStickers);
    };

    const updateHistory = (newStickers) => {
        const newHistory = history.slice(0, currentStep + 1);
        newHistory.push(newStickers);
        setHistory(newHistory);
        setCurrentStep(newHistory.length - 1);
        setStickers(newStickers);
    };

    const undo = () => {
        if (currentStep > 0) {
            setStickers(history[currentStep - 1]);
            setCurrentStep(currentStep - 1);
        }
    };

    const redo = () => {
        if (currentStep < history.length - 1) {
            setStickers(history[currentStep + 1]);
            setCurrentStep(currentStep + 1);
        }
    };

    const downloadCanvas = () => {
        const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
        const link = document.createElement('a');
        link.download = 'canvas-image.png';
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className='relative'>
            <Stage width={windowSize.width} height={windowSize.height} ref={stageRef}>
                <Layer>
                    <Image image={backgroundImage} width={windowSize.width} height={windowSize.height} onClick={handleBackgroundClick} onTouchEnd={handleBackgroundClick} alt="bg" />
                    {stickers.map((sticker, sIdx) =>
                        sticker.positions.map((pos, pIdx) =>
                            <Image key={`${sIdx}-${pIdx}`} image={stickerImages[sIdx][0]} x={pos.x} y={pos.y} width={51.2} height={51.2} alt="sticker" draggable
                                onDragEnd={(e) => handleDragEnd(e, sIdx, pIdx)} />
                        )
                    )}
                    {toyImage && <Image image={toyImage} x={(windowSize.width - toyImage.width) / 2} y={(windowSize.height - toyImage.height) / 2} alt="toy" listening={false} />}
                </Layer>
            </Stage>
            <div className="controls absolute top-4 bg-white p-4 left-4 rounded-md">
                <div className='flex gap-2'>
                    {backgrounds.map((bg, i) => (
                        <button key={i} onClick={() => setCurrentBackground(bg)}>
                            <ImageComponent src={bg} alt={`Background ${i}`} width="50" height="50" />
                        </button>
                    ))}
                </div>
                <div className='flex gap-2'>
                    {toys.map((toy, i) => (
                        <button key={i} onClick={() => setCurrentToy(toy)}>
                            <ImageComponent src={toy} alt={`Toy ${i}`} width="50" height="50" />
                        </button>
                    ))}
                </div>
                <div className='flex gap-2'>
                    {stickers.map((sticker, i) => (
                        <button key={i} onClick={() => setSelectedStickerIndex(i)}>
                            <ImageComponent src={sticker.src} alt={`Sticker ${i}`} width="50" height="50" />
                        </button>
                    ))}
                </div>
                <div className='flex justify-center items-center gap-8'>
                    <button className='bg-black text-white rounded-md p-2 text-sm' onClick={undo}>
                        <MdUndo size="24px" />
                    </button>
                    <button className='bg-black text-white rounded-md p-2 text-sm' onClick={redo}>
                        <MdRedo size="24px" />
                    </button>
                </div>
                <button className='px-4 py-3 bg-blue-600 rounded-md text-white outline-none focus:ring-4 shadow-lg transform active:scale-x-75 transition-transform mx-5 flex' onClick={downloadCanvas}>
                    <MdFileDownload size="20px" />
                    <span className='ml-2'>Download</span>
                </button>
            </div>
        </div>
    );
};

export default function Home() {
    return <div><KonvaCanvas /></div>;
}
