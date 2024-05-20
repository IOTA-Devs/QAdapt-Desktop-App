import { UploadImageProps } from '@/types/types';
import Cropper from 'cropperjs';
import "cropperjs/dist/cropper.css";
import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { dataURIToBlob } from '@/util/util.helper';

export default function UploadImage(props: UploadImageProps) {
    const [selectedImage, setSelectedImage] = useState<string | ArrayBuffer | null>(null);
    const [message, setMessage] = useState<string>('Drag here to upload');
    const [draggingClass, setDraggingClass] = useState<string>('');
    const cropperRef = useRef<HTMLImageElement>(null);
    let cropperObjRef = useRef<Cropper | null>(null);

    useEffect(() => {
        setMessage('Please select or drag an image');
        if (cropperObjRef.current) cropperObjRef.current.destroy();
        if (!selectedImage || !cropperRef.current) return;

        cropperObjRef.current = new Cropper(cropperRef.current, {
            aspectRatio: props.aspectRatio,
            viewMode: 1,
            minCropBoxHeight: 100,
            minCropBoxWidth: 100,
            background: false,
            responsive: true,
            autoCropArea: 1,
            checkOrientation: false,
            guides: true
        });
    }, [selectedImage]);

    const validateImage = (file: File) => {
        const fileSize = file.size / 1000 / 1000;
        
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (validTypes.indexOf(file.type) === -1) {
            setMessage('Invalid file type. Only JPEG, PNG, and JPG are allowed');
            return;
        }

        if (fileSize > props.maxImageSizeInMb) {
            setMessage('File size cannot exceed 8MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setSelectedImage(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        setDraggingClass('');
        if (!e.dataTransfer.files) {
            setMessage('Please select or drag an image');
            return;
        }

        validateImage(e.dataTransfer.files[0]);
    }

    const getCroppedImage = () => {
        if (!cropperObjRef.current) return;
        const canvas = cropperObjRef.current.getCroppedCanvas();
        const uriData = canvas.toDataURL('image/jpeg', 0.8);

        const blob = dataURIToBlob(uriData, 'image/jpeg');
        props.onCrop(blob);
    }

    return (
        <div className="relative w-full h-full overflow-hidden">
            <div 
            style={selectedImage ? { display: "none" } : {}}
            onDrop={handleDrop}
            onDragEnter={() => setDraggingClass('border-2 border-dashed border-primary')}
            onDragLeave={() => setDraggingClass('')}
            className={`flex flex-col items-center justify-center rounded-sm border-2 border-dashed border-secondary p-20 text-muted-foreground hover:border-primary hover:text-primary transition-all ease-in-out ${draggingClass}`}>
                <input 
                className="absolute top-0 left-0 w-full h-full cursor-pointer z-10 opacity-0" 
                type="file" 
                name="pfp" 
                onChange={(e) => {
                    if (!e.target.files) {
                        setMessage('Please select or drag an image');
                        return;
                    }

                    validateImage(e.target.files[0]);
                }} accept="image/*"/>
                <h3 className="font-bold">Click to upload image</h3>
                <span className="bg-secondary w-5 h-[1px] my-2"></span>
                <p className="text-center">{message}</p>
            </div>
            <div style={!selectedImage ? { display: "none" } : { minWidth: "200px" }}>
                <img style={{ height: props.height, maxWidth: "100%", display: "100%" }} ref={cropperRef} src={selectedImage as string} alt="profile-picture"/>
                <Button variant="default" onClick={() => getCroppedImage()} style={{ marginTop: "10px", width: "100%" }}>Upload</Button>
                <Button variant="secondary" onClick={() => setSelectedImage(null)} style={{ marginTop: "10px", width: "100%" }}>Choose Another Image</Button>
            </div>
        </div>
    );
}