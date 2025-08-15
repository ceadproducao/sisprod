import "react-image-crop/dist/ReactCrop.css"
import ReactCrop, {
    makeAspectCrop,
    PixelCrop,
    convertToPixelCrop,
    centerCrop,
} from "react-image-crop";
import { useState, useRef } from "react";
import styles from "./styles.module.css";

export default function Cropper({
    file,
    setFoto,
    setOpenCropper
}: {
    file: File;
    setFoto: Function,
    setOpenCropper: Function;
}) {
    const [crop, setCrop] = useState<PixelCrop>({
        unit: "px",
        x: 0,
        y: 0,
        width: 200,
        height: 200,
    });

    const [hasLoaded, setHasLoaded] = useState(false);
    const imageRef = useRef<HTMLImageElement | null>(null);

    async function getCroppedImage(): Promise<Blob | null> {
        if (!imageRef.current || !crop?.width || !crop?.height) return null;

        const canvas = document.createElement("canvas");
        const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
        const scaleY = imageRef.current.naturalHeight / imageRef.current.height;

        canvas.width = crop.width;
        canvas.height = crop.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        ctx.drawImage(
            imageRef.current,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, "image/jpeg");
        });
    }

    return (
        <div className={styles.bg}>
            <div className={styles.cropperContainer}>
                <ReactCrop
                    crop={crop}
                    circularCrop
                    keepSelection
                    aspect={1}
                    minWidth={200}
                    onChange={(cropNovo) => setCrop(cropNovo)}
                    className={styles.cropper}
                >
                    <img
                        ref={imageRef}
                        src={URL.createObjectURL(file)}
                        onLoad={(e) => {
                            if (hasLoaded) return;
                            setHasLoaded(true);

                            const { width, height } = e.currentTarget;
                            const initialCrop = convertToPixelCrop(
                                centerCrop(
                                    makeAspectCrop({ unit: "px", width: 200 }, 1, width, height),
                                    width,
                                    height
                                ),
                                width,
                                height
                            );
                            setCrop(initialCrop);
                        }}
                        alt="Imagem para recortar"
                    />
                </ReactCrop>
                <button className={styles.btn} onClick={async () => {
                    const blob = await getCroppedImage();
                    if (blob) {
                        setFoto(new File([blob], "foto-cortada.jpg", { type: "image/jpeg" })); // Ou use como quiser
                        setOpenCropper(false);
                    }
                }}>Salvar</button>
            </div>
        </div>
    );
}
