"use client"
import * as ImagePicker from "expo-image-picker"
import * as MediaLibrary from "expo-media-library"
import { useRef, useState } from "react"
import { Alert, Dimensions, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from "react-native-reanimated"
import { SafeAreaView } from "react-native-safe-area-context"
import Svg, { Circle, Polygon, Rect } from "react-native-svg"
import { captureRef } from "react-native-view-shot"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")


const CANVAS_WIDTH = screenWidth - 40
const CANVAS_HEIGHT = screenHeight * 0.6

interface CanvasElement {
    id: string
    type: "text" | "image" | "shape"
    x: number
    y: number
    width?: number
    height?: number
    scale?: number
    rotation?: number
    text?: string
    fontSize?: number
    color?: string
    uri?: string
    shapeType?: "circle" | "triangle" | "rectangle" | "star" | "hexagon"
    shapeColor?: string
    fontWeight?: string
    fontStyle?: string
    textAlign?: "left" | "center" | "right"
    fontFamily?: string
}


export default function DesignEditor() {

    const [showAspectModal, setShowAspectModal] = useState(false);
    const [selectedAspect, setSelectedAspect] = useState<[number, number] | null>([1, 1]);

    const [textStyleType, setTextStyleType] = useState<"heading" | "subtitle">("heading");
    const [textColor, setTextColor] = useState("#000000");
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("center");
    const [fontFamily, setFontFamily] = useState("System"); // fallback: system font

    const [showEditModal, setShowEditModal] = useState(false);

    const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([])
    const [selectedElement, setSelectedElement] = useState<string | null>(null)
    const [showTextModal, setShowTextModal] = useState(false)
    const [showShapeModal, setShowShapeModal] = useState(false)
    const [textInput, setTextInput] = useState("")
    const canvasRef = useRef<View>(null)


    const addTextToCanvas = () => {
        setTextInput("Sample Text")
        setShowTextModal(true)
    }


    const confirmAddText = () => {
        const newTextElement: CanvasElement = {
            id: Date.now().toString(),
            type: "text",
            text: textInput || (textStyleType === "heading" ? "Heading" : "Subtitle"),
            x: CANVAS_WIDTH / 2 - 75,
            y: CANVAS_HEIGHT / 2 - 25,
            fontSize: textStyleType === "heading" ? 28 : 20,
            color: textColor,
            scale: 1,
            rotation: 0,
            fontWeight: isBold ? "bold" : "normal",
            fontStyle: isItalic ? "italic" : "normal",
            textAlign,
            fontFamily,
        };

        setCanvasElements((prev) => [...prev, newTextElement]);

        // reset state
        setShowTextModal(false);
        setTextInput("");
        setTextStyleType("heading");
        setTextColor("#000000");
        setIsBold(false);
        setIsItalic(false);
        setTextAlign("center");
        setFontFamily("System");
    };




    const addShapeToCanvas = () => {
        setShowShapeModal(true)
    }

    const addSelectedShape = (shapeType: "circle" | "triangle" | "rectangle" | "star" | "hexagon") => {
        const shapeColors = ["#007AFF", "#34C759", "#FF9500", "#FF2D55", "#5856D6"]
        const randomColor = shapeColors[Math.floor(Math.random() * shapeColors.length)]
        
        const newShapeElement: CanvasElement = {
            id: Date.now().toString(),
            type: "shape",
            shapeType: shapeType,
            x: CANVAS_WIDTH / 2 - 50,
            y: CANVAS_HEIGHT / 2 - 50,
            width: 100,
            height: 100,
            scale: 1,
            rotation: 0,
            shapeColor: randomColor,
        }

        setCanvasElements((prev) => [...prev, newShapeElement])
        setShowShapeModal(false)
        Alert.alert("Shape Added", `${shapeType} has been added to canvas!`)
    }


    const addImageToCanvas = () => {
        setShowAspectModal(true);
        };

        const pickImageWithAspect = async (aspect: [number, number] | null) => {
        try {
            setShowAspectModal(false);

            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
            Alert.alert("Permission needed", "Please grant camera roll permissions to add images.");
            return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: aspect !== null, // only allow crop when aspect is selected
            aspect: aspect || undefined,
            quality: 1,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
            const newImageElement: CanvasElement = {
                id: Date.now().toString(),
                type: "image",
                uri: result.assets[0].uri,
                x: CANVAS_WIDTH / 2 - 75,
                y: CANVAS_HEIGHT / 2 - 75,
                width: 150,
                height: 150,
                scale: 1,
                rotation: 0,
            };

            setCanvasElements((prev) => [...prev, newImageElement]);
            Alert.alert("Image Added", "Image has been added to canvas!");
            }
        } catch (error) {
            Alert.alert("Error", "Failed to pick image");
        }
        };




    const exportCanvas = async () => {
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync()
            if (status !== "granted") {
                Alert.alert("Permission needed", "Please grant media library permissions to save images.")
                return
            }

            if (canvasRef.current) {
                const uri = await captureRef(canvasRef.current, {
                    format: "png",
                    quality: 1.0,
                })

                await MediaLibrary.saveToLibraryAsync(uri)
                Alert.alert("Success", "Design exported to your gallery!")
            }
        } catch (error) {
            Alert.alert("Error", "Failed to export design")
        }
    }

    const deleteElement = () => {
        if (selectedElement) {
            setCanvasElements((prev) => prev.filter((el) => el.id !== selectedElement))
            setSelectedElement(null)
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Design Editor</Text>
                <Text style={styles.debugText}>Elements: {canvasElements.length}</Text>
                {selectedElement && (
                    <TouchableOpacity style={styles.deleteButton} onPress={deleteElement}>
                        <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Canvas Area */}
            <View style={styles.canvasContainer}>
                <View ref={canvasRef} style={styles.canvas}>
                    {canvasElements.length === 0 ? (
                        <>
                            <Text style={styles.canvasPlaceholder}>Canvas Area</Text>
                            <Text style={styles.canvasInfo}>Add text, images, or shapes</Text>
                        </>
                    ) : null}

                    {/* Render canvas elements */}
                    {canvasElements.map((element) => (
                        <DraggableElement
                            key={element.id}
                            element={element}
                            isSelected={selectedElement === element.id}
                            onSelect={() => setSelectedElement(element.id)}
                            onShowEdit={() => setShowEditModal(true)}
                            onUpdate={(updatedElement) => {
                                setCanvasElements((prev) =>
                                    prev.map((el) => (el.id === element.id ? { ...el, ...updatedElement } : el)),
                                )
                            }}
                        />
                    ))}
                </View>
            </View>

            {/* Toolbar */}
            <SafeAreaView style={styles.toolbarSafeArea} edges={["bottom"]}>
                <View style={styles.toolbar}>
                    <View style={styles.toolbarButtons}>
                        <TouchableOpacity style={styles.toolbarButton} onPress={addTextToCanvas}>
                            <Text style={styles.buttonIcon}>📝</Text>
                            <Text style={styles.buttonLabel}>Add Text</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.toolbarButton} onPress={addImageToCanvas}>
                            <Text style={styles.buttonIcon}>🖼️</Text>
                            <Text style={styles.buttonLabel}>Add Image</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.toolbarButton} onPress={addShapeToCanvas}>
                            <Text style={styles.buttonIcon}>🔷</Text>
                            <Text style={styles.buttonLabel}>Add Shape</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.toolbarButton, styles.exportButton]} onPress={exportCanvas}>
                            <Text style={styles.buttonIcon}>💾</Text>
                            <Text style={[styles.buttonLabel, styles.exportButtonText]}>Export</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
            <View style={styles.footer}>
            <Text style={styles.footerText}>© 2025 Md. Farhan Sadik. All rights reserved.</Text>
            </View>

            {/* Text Input Modal */}
            <Modal visible={showTextModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add Text</Text>

                        {/* Text Style Selector */}
                        <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 10 }}>
                            <TouchableOpacity
                                style={[styles.textStyleButton, textStyleType === "heading" && styles.textStyleButtonActive]}
                                onPress={() => setTextStyleType("heading")}
                            >
                                <Text style={[
                                    styles.textStyleText,
                                    textStyleType === "heading" && { color: "#fff" }
                                ]}>Heading</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.textStyleButton, textStyleType === "subtitle" && styles.textStyleButtonActive]}
                                onPress={() => setTextStyleType("subtitle")}
                            >
                                <Text style={[
                                    styles.textStyleText,
                                    textStyleType === "subtitle" && { color: "#fff" }
                                ]}>Subtitle</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Color Picker */}
                        <Text style={{ marginBottom: 6, fontWeight: "600", color: "#333" }}>Choose Text Color:</Text>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
                            {["#000000", "#FFFFFF", "#FF3B30", "#007AFF", "#34C759", "#FF9500"].map((color) => (
                                <TouchableOpacity
                                    key={color}
                                    onPress={() => setTextColor(color)}
                                    style={{
                                        backgroundColor: color,
                                        width: 32,
                                        height: 32,
                                        borderRadius: 16,
                                        borderWidth: textColor === color ? 3 : 1,
                                        borderColor: textColor === color ? "#444" : "#ccc",
                                    }}
                                />
                            ))}
                        </View>

                        {/* Text Alignment Selector */}
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
                            <TouchableOpacity
                                style={[styles.toggleButton, isBold && styles.toggleButtonActive]}
                                onPress={() => setIsBold(!isBold)}
                            >
                                <Text style={[styles.toggleButtonText, isBold && { color: "#fff" }]}>B</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.toggleButton, isItalic && styles.toggleButtonActive]}
                                onPress={() => setIsItalic(!isItalic)}
                            >
                                <Text style={[styles.toggleButtonText, isItalic && { color: "#fff", fontStyle: "italic" }]}>I</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
                            {["left", "center", "right"].map((align) => (
                                <TouchableOpacity
                                    key={align}
                                    style={[styles.toggleButton, textAlign === align && styles.toggleButtonActive]}
                                    onPress={() => setTextAlign(align as "left" | "center" | "right")}
                                >
                                    <Text style={[
                                        styles.toggleButtonText,
                                        textAlign === align && { color: "#fff" }
                                    ]}>{align.toUpperCase()}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Font Family Selector */}
                        <View style={{ marginBottom: 10 }}>
                            <Text style={{ fontWeight: "600", marginBottom: 4 }}>Font Family:</Text>
                            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                                {["System", "sans-serif", "serif", "monospace"].map((font) => (
                                    <TouchableOpacity
                                        key={font}
                                        onPress={() => setFontFamily(font)}
                                        style={[styles.fontFamilyButton, fontFamily === font && styles.fontFamilyButtonActive]}
                                    >
                                        <Text style={{
                                            fontFamily: font,
                                            color: fontFamily === font ? "#fff" : "#000",
                                            fontSize: 14,
                                        }}>
                                            {font}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>



                        {/* Text Input */}
                        <TextInput
                            style={styles.textInput}
                            value={textInput}
                            onChangeText={setTextInput}
                            placeholder="Enter your text here..."
                            multiline
                            autoFocus
                        />

                        {/* Buttons */}
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.modalButton} onPress={() => setShowTextModal(false)}>
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={confirmAddText}
                            >
                                <Text style={[styles.modalButtonText, styles.confirmButtonText]}>Add Text</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>


            {/* Aspect Ratio Selection Modal */}
            <Modal visible={showAspectModal} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Crop Ratio</Text>
                <View style={styles.aspectGrid}>
                    <TouchableOpacity style={styles.aspectOption} onPress={() => pickImageWithAspect([1, 1])}>
                    <Text style={styles.aspectText}>1:1</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.aspectOption} onPress={() => pickImageWithAspect([4, 3])}>
                    <Text style={styles.aspectText}>4:3</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.aspectOption} onPress={() => pickImageWithAspect([16, 9])}>
                    <Text style={styles.aspectText}>16:9</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.aspectOption} onPress={() => pickImageWithAspect([3, 2])}>
                    <Text style={styles.aspectText}>3:2</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.aspectOption, { backgroundColor: "#34C759" }]} onPress={() => pickImageWithAspect(null)}>
                    <Text style={styles.aspectText}>Free Style</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.modalButton} onPress={() => setShowAspectModal(false)}>
                    <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                </View>
            </View>
            </Modal>

            {/* Edit Modal */}
            <Modal visible={showEditModal && !!selectedElement} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Element</Text>
                        {(() => {
                            const element = canvasElements.find(e => e.id === selectedElement);
                            if (!element) return null;

                            if (element.type === "text") {
                                return (
                                    <>
                                        <TextInput
                                            style={styles.textInput}
                                            value={element.text}
                                            onChangeText={(text) =>
                                                setCanvasElements((prev) =>
                                                    prev.map((el) =>
                                                        el.id === element.id ? { ...el, text } : el
                                                    )
                                                )
                                            }
                                            placeholder="Edit text..."
                                            multiline
                                        />
                                        <Text style={{ fontWeight: "600", marginBottom: 6 }}>Text Color:</Text>
                                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
                                            {["#000000", "#FF3B30", "#007AFF", "#34C759", "#FF9500"].map((color) => (
                                                <TouchableOpacity
                                                    key={color}
                                                    onPress={() =>
                                                        setCanvasElements((prev) =>
                                                            prev.map((el) =>
                                                                el.id === element.id ? { ...el, color } : el
                                                            )
                                                        )
                                                    }
                                                    style={{
                                                        backgroundColor: color,
                                                        width: 30,
                                                        height: 30,
                                                        borderRadius: 15,
                                                        borderWidth: 2,
                                                        borderColor: element.color === color ? "#444" : "#ccc",
                                                    }}
                                                />
                                            ))}
                                        </View>
                                    </>
                                );
                            }

                            if (element.type === "shape") {
                                return (
                                    <>
                                        <Text style={{ fontWeight: "600", marginBottom: 6 }}>Shape Color:</Text>
                                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
                                            {["#007AFF", "#34C759", "#FF9500", "#FF2D55", "#5856D6"].map((color) => (
                                                <TouchableOpacity
                                                    key={color}
                                                    onPress={() =>
                                                        setCanvasElements((prev) =>
                                                            prev.map((el) =>
                                                                el.id === element.id ? { ...el, shapeColor: color } : el
                                                            )
                                                        )
                                                    }
                                                    style={{
                                                        backgroundColor: color,
                                                        width: 30,
                                                        height: 30,
                                                        borderRadius: 15,
                                                        borderWidth: 2,
                                                        borderColor: element.shapeColor === color ? "#444" : "#ccc",
                                                    }}
                                                />
                                            ))}
                                        </View>
                                    </>
                                );
                            }

                            return <Text>No editable properties available for this type.</Text>;
                        })()}

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.modalButton} onPress={() => setShowEditModal(false)}>
                                <Text style={styles.modalButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>


            {/* Shape Selection Modal */}
            <Modal visible={showShapeModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Shape</Text>
                        <View style={styles.shapeGrid}>
                            <TouchableOpacity 
                                style={styles.shapeOption} 
                                onPress={() => addSelectedShape("circle")}
                            >
                                <View style={styles.shapePreviewWrapper}>
                                    <View style={[styles.shapePreview, styles.circlePreview]} />
                                </View>
                                <Text style={styles.shapeLabel}>Circle</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.shapeOption} 
                                onPress={() => addSelectedShape("triangle")}
                            >
                                <View style={styles.shapePreviewWrapper}>
                                    <View style={[styles.shapePreview, styles.trianglePreview]} />
                                </View>
                                <Text style={styles.shapeLabel}>Triangle</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.shapeOption} 
                                onPress={() => addSelectedShape("rectangle")}
                            >
                                <View style={styles.shapePreviewWrapper}>
                                    <View style={[styles.shapePreview, styles.rectanglePreview]} />
                                </View>
                                <Text style={styles.shapeLabel}>Rectangle</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.shapeOption} 
                                onPress={() => addSelectedShape("star")}
                            >
                                <View style={styles.shapePreviewWrapper}>
                                    <Text style={styles.shapeIconPreview}>★</Text>
                                </View>
                                <Text style={styles.shapeLabel}>Star</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.shapeOption} 
                                onPress={() => addSelectedShape("hexagon")}
                            >
                                <View style={styles.shapePreviewWrapper}>
                                    <Text style={styles.shapeIconPreview}>⬡</Text>
                                </View>
                                <Text style={styles.shapeLabel}>Hexagon</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity 
                            style={[styles.modalButton, { marginTop: 15 }]} 
                            onPress={() => setShowShapeModal(false)}
                        >
                            <Text style={styles.modalButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

function DraggableElement({
    element,
    isSelected,
    onSelect,
    onUpdate,
    onShowEdit,
}: {
    element: CanvasElement
    isSelected: boolean
    onSelect: () => void
    onUpdate: (updates: Partial<CanvasElement>) => void
    onShowEdit: () => void
}) {
    const translateX = useSharedValue(element.x)
    const translateY = useSharedValue(element.y)
    const scale = useSharedValue(element.scale || 1)

    const lastTap = useRef<number>(0);

    const panGesture = Gesture.Pan()
        .onBegin(() => {
            const now = Date.now();
            const timeDiff = now - lastTap.current;
            
            runOnJS(onSelect)();
            
            // Check for double tap (within 300ms)
            if (timeDiff < 300) {
                runOnJS(onShowEdit)();
            }
            
            lastTap.current = now;
        })
        .onUpdate((event) => {
            translateX.value = event.translationX + element.x
            translateY.value = event.translationY + element.y
        })
        .onEnd(() => {
            runOnJS(onUpdate)({
                x: translateX.value,
                y: translateY.value,
            })
        })

    const pinchGesture = Gesture.Pinch()
        .onBegin(() => {
            runOnJS(onSelect)()
            // Remove onShowEdit from pinch gesture
        })
        .onUpdate((event) => {
            scale.value = (element.scale || 1) * event.scale
        })
        .onEnd(() => {
            runOnJS(onUpdate)({
                scale: scale.value,
            })
        })

    const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture)

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: scale.value }],
    }))

    const renderElement = () => {
        switch (element.type) {
        case "text":
            return (
                <Text
                    style={[
                        styles.canvasText,
                        {
                            fontSize: element.fontSize,
                            color: element.color,
                            fontWeight: element.fontWeight as any,
                            fontStyle: element.fontStyle as any,
                            textAlign: element.textAlign as any,
                            fontFamily: element.fontFamily,
                        },
                    ]}
                >
                    {element.text}
                </Text>
            );

            case "image":
                return (
                    <Image
                        source={{ uri: element.uri }}
                        style={[styles.canvasImage, { width: element.width, height: element.height }]}
                        resizeMode="cover"
                    />
                )
            case "shape":
                return (
                    <Svg width={element.width} height={element.height} style={styles.canvasShape}>
                        {renderShape()}
                    </Svg>
                )
            default:
                return null
        }
    }

    const renderShape = () => {
        const fill = element.shapeColor || "#007AFF"
        const stroke = element.shapeColor ? darkenColor(element.shapeColor, 20) : "#0056CC"
        
        switch (element.shapeType) {
            case "circle":
                return (
                    <Circle
                        cx={element.width! / 2}
                        cy={element.height! / 2}
                        r={element.width! / 2 - 5}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth="2"
                    />
                )
            case "triangle":
                return (
                    <Polygon
                        points={`${element.width! / 2},5 5,${element.height! - 5} ${element.width! - 5},${element.height! - 5}`}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth="2"
                    />
                )
            case "rectangle":
                return (
                    <Rect
                        x="5"
                        y="5"
                        width={element.width! - 10}
                        height={element.height! - 10}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth="2"
                        rx="8"
                        ry="8"
                    />
                )
            case "star":
                const centerX = element.width! / 2
                const centerY = element.height! / 2
                const outerRadius = Math.min(centerX, centerY) - 5
                const innerRadius = outerRadius / 2
                let points = ""
                
                for (let i = 0; i < 5; i++) {
                    const outerX = centerX + outerRadius * Math.cos(i * 2 * Math.PI / 5 - Math.PI / 2)
                    const outerY = centerY + outerRadius * Math.sin(i * 2 * Math.PI / 5 - Math.PI / 2)
                    const innerX = centerX + innerRadius * Math.cos((i * 2 + 1) * Math.PI / 5 - Math.PI / 2)
                    const innerY = centerY + innerRadius * Math.sin((i * 2 + 1) * Math.PI / 5 - Math.PI / 2)
                    
                    points += `${outerX},${outerY} ${innerX},${innerY} `
                }
                
                return (
                    <Polygon
                        points={points}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth="2"
                    />
                )
            case "hexagon":
                const hexCenterX = element.width! / 2
                const hexCenterY = element.height! / 2
                const hexRadius = Math.min(hexCenterX, hexCenterY) - 5
                let hexPoints = ""
                
                for (let i = 0; i < 6; i++) {
                    const x = hexCenterX + hexRadius * Math.cos(i * 2 * Math.PI / 6)
                    const y = hexCenterY + hexRadius * Math.sin(i * 2 * Math.PI / 6)
                    hexPoints += `${x},${y} `
                }
                
                return (
                    <Polygon
                        points={hexPoints}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth="2"
                    />
                )
            default:
                return null
        }
    }

    const darkenColor = (color: string, percent: number) => {
        const num = parseInt(color.replace("#", ""), 16)
        const amt = Math.round(2.55 * percent)
        const R = (num >> 16) - amt
        const G = (num >> 8 & 0x00FF) - amt
        const B = (num & 0x0000FF) - amt
        
        return "#" + (
            0x1000000 + 
            (R < 0 ? 0 : R) * 0x10000 + 
            (G < 0 ? 0 : G) * 0x100 + 
            (B < 0 ? 0 : B)
        ).toString(16).slice(1)
    }

    return (
        <GestureDetector gesture={composedGesture}>
            <Animated.View style={[styles.elementContainer, animatedStyle, isSelected && styles.selectedElement]}>
                {renderElement()}
            </Animated.View>
        </GestureDetector>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    header: {
        backgroundColor: "#ffffff",
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
    },
    debugText: {
        fontSize: 12,
        color: "#666",
        textAlign: "center",
        marginTop: 4,
    },
    deleteButton: {
        position: "absolute",
        right: 20,
        top: 15,
        backgroundColor: "#FF3B30",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    deleteButtonText: {
        color: "#ffffff",
        fontSize: 12,
        fontWeight: "600",
    },
    canvasContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    canvas: {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        backgroundColor: "#ffffff",
        borderRadius: 12,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#e8e8e8",
        position: "relative",
    },
    canvasPlaceholder: {
        fontSize: 18,
        color: "#999",
        fontWeight: "600",
    },
    canvasInfo: {
        fontSize: 12,
        color: "#bbb",
        marginTop: 8,
        textAlign: "center",
    },
    elementContainer: {
        position: "absolute",
    },
    selectedElement: {
        borderWidth: 2,
        borderColor: "#007AFF",
        borderStyle: "dashed",
        borderRadius: 4,
    },
    canvasText: {
        fontWeight: "600",
        textAlign: "center",
        padding: 8,
    },
    canvasImage: {
        borderRadius: 8,
    },
    canvasShape: {
    },
    toolbarSafeArea: {
        backgroundColor: "#ffffff",
    },
    toolbar: {
        backgroundColor: "#ffffff",
        paddingVertical: 20,
        paddingHorizontal: 15,
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    toolbarButtons: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center",
    },
    toolbarButton: {
        backgroundColor: "#007AFF",
        width: 70,
        height: 70,
        borderRadius: 12,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonIcon: {
        fontSize: 20,
        marginBottom: 4,
    },
    buttonLabel: {
        color: "#ffffff",
        fontSize: 10,
        fontWeight: "600",
        textAlign: "center",
        lineHeight: 11,
    },
    exportButton: {
        backgroundColor: "#34C759",
    },
    exportButtonText: {
        color: "#ffffff",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#ffffff",
        borderRadius: 12,
        padding: 20,
        width: screenWidth - 40,
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 15,
        color: "#333",
    },
    textInput: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        minHeight: 80,
        textAlignVertical: "top",
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginHorizontal: 5,
        backgroundColor: "#f0f0f0",
    },
    confirmButton: {
        backgroundColor: "#007AFF",
    },
    modalButtonText: {
        textAlign: "center",
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    confirmButtonText: {
        color: "#ffffff",
    },
    shapeGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginVertical: 10,
    },
    shapeOption: {
        width: "30%",
        marginBottom: 15,
        alignItems: "center",
    },
    shapePreviewWrapper: {
        width: 60,
        height: 60,
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 5,
    },
    shapePreview: {
        backgroundColor: "#007AFF",
    },
    circlePreview: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    trianglePreview: {
        width: 0,
        height: 0,
        backgroundColor: "transparent",
        borderStyle: "solid",
        borderLeftWidth: 20,
        borderRightWidth: 20,
        borderBottomWidth: 40,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderBottomColor: "#007AFF",
    },
    rectanglePreview: {
        width: 40,
        height: 30,
        borderRadius: 4,
    },
    shapeIconPreview: {
        fontSize: 40,
        color: "#007AFF",
    },
    shapeLabel: {
        fontSize: 12,
        color: "#333",
        fontWeight: "500",
    },
    footer: {
    backgroundColor: "#f5f5f5",
    paddingVertical: 10,
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#e0e0e0",
    },
    footerText: {
    fontSize: 12,
    color: "#999999",
    },
    aspectGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginVertical: 10,
    },
    aspectOption: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
    },
    aspectText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    },
    textStyleButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#ccc",
        backgroundColor: "#f5f5f5",
    },
    textStyleButtonActive: {
        backgroundColor: "#007AFF",
        borderColor: "#007AFF",
    },
    textStyleText: {
        fontWeight: "600",
        color: "#333",
    },
    toggleButton: {
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 6,
        backgroundColor: "#f0f0f0",
        borderWidth: 1,
        borderColor: "#ccc",
        marginRight: 8,
    },
    toggleButtonActive: {
        backgroundColor: "#007AFF",
        borderColor: "#007AFF",
    },
    toggleButtonText: {
        fontWeight: "bold",
        color: "#333",
        fontSize: 16,
    },

    fontFamilyButton: {
        backgroundColor: "#e0e0e0",
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 6,
        marginRight: 8,
    },
    fontFamilyButtonActive: {
        backgroundColor: "#007AFF",
    },


});
