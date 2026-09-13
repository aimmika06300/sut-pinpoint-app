import React, { useState } from 'react';
import {
    Alert,
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    CameraView,
    useCameraPermissions,
} from 'expo-camera';

export default function Scanner({ onBack }) {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    // ยังโหลด permission ไม่เสร็จ
    if (!permission) {
        return (
            <View style={styles.container} />
        );
    }

    // ยังไม่ได้รับอนุญาตให้ใช้กล้อง
    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>
                    ต้องอนุญาตให้แอปใช้กล้องก่อน
                </Text>

                <TouchableOpacity
                    style={styles.permissionButton}
                    onPress={requestPermission}
                >
                    <Text style={styles.buttonText}>
                        อนุญาตให้ใช้กล้อง
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.backButton}
                    onPress={onBack}
                >
                    <Text style={styles.buttonText}>
                        กลับ
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    // เมื่อพบ QR Code
    const handleBarcodeScanned = async ({ data }) => {
        // ป้องกันการอ่าน QR ซ้ำหลายครั้ง
        if (scanned) {
            return;
        }

        setScanned(true);

        console.log('QR CODE:', data);

        // ==========================================
        // ถ้า QR เป็น URL ให้เปิดเว็บไซต์ทันที
        // ==========================================
        if (
            data.startsWith('http://') ||
            data.startsWith('https://')
        ) {
            try {
                const supported = await Linking.canOpenURL(data);

                if (supported) {
                    console.log('OPEN URL:', data);

                    await Linking.openURL(data);

                    // เปิดเว็บแล้ว กลับมา Scanner
                    // สามารถสแกน QR ใหม่ได้
                    setTimeout(() => {
                        setScanned(false);
                    }, 1000);
                } else {
                    Alert.alert(
                        'ไม่สามารถเปิดเว็บไซต์ได้',
                        data,
                        [
                            {
                                text: 'ตกลง',
                                onPress: () => {
                                    setScanned(false);
                                },
                            },
                        ]
                    );
                }
            } catch (error) {
                console.error(
                    'OPEN URL ERROR:',
                    error
                );

                Alert.alert(
                    'เกิดข้อผิดพลาด',
                    'ไม่สามารถเปิดเว็บไซต์นี้ได้',
                    [
                        {
                            text: 'ตกลง',
                            onPress: () => {
                                setScanned(false);
                            },
                        },
                    ]
                );
            }

            return;
        }

        // ==========================================
        // ถ้า QR ไม่ใช่ URL
        // ให้แสดงข้อมูลที่ QR เก็บไว้
        // ==========================================
        Alert.alert(
            'QR Code',
            data,
            [
                {
                    text: 'ตกลง',
                    onPress: () => {
                        setScanned(false);
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>

            {/* =========================
                CAMERA
            ========================== */}
            <CameraView
                style={styles.camera}
                facing="front"

                onCameraReady={() => {
                    console.log('CAMERA READY');
                }}

                onMountError={(error) => {
                    console.log(
                        'CAMERA MOUNT ERROR:',
                        error
                    );
                }}

                onBarcodeScanned={
                    scanned
                        ? undefined
                        : handleBarcodeScanned
                }

                barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                }}
            />

            {/* =========================
                TOP BAR
            ========================== */}
            <View style={styles.topBar}>

                <TouchableOpacity
                    style={styles.backButtonTop}
                    onPress={onBack}
                >
                    <Text style={styles.backText}>
                        ‹
                    </Text>
                </TouchableOpacity>

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>
                        Scan QR Code
                    </Text>

                    <Text style={styles.subtitle}>
                        สแกน QR Code เพื่อเปิดเว็บไซต์
                    </Text>
                </View>

            </View>

            {/* =========================
                SCAN BOX
            ========================== */}
            <View style={styles.scanBox}>

                <View style={styles.cornerTopLeft} />

                <View style={styles.cornerTopRight} />

                <View style={styles.cornerBottomLeft} />

                <View style={styles.cornerBottomRight} />

            </View>

            {/* =========================
                BOTTOM INFORMATION
            ========================== */}
            <View style={styles.bottomContainer}>

                <Text style={styles.scanText}>
                    วาง QR Code ให้อยู่ในกรอบ
                </Text>

                <Text style={styles.scanSubText}>
                    ระบบจะสแกนและเปิดเว็บไซต์ให้อัตโนมัติ
                </Text>

            </View>

        </View>
    );
}

const styles = StyleSheet.create({

    // =========================
    // MAIN
    // =========================

    container: {
        flex: 1,
        backgroundColor: '#000',
    },

    camera: {
        flex: 1,
    },

    // =========================
    // PERMISSION
    // =========================

    permissionContainer: {
        flex: 1,
        backgroundColor: '#F8F4E9',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },

    permissionText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#5C3A21',
        marginBottom: 20,
        textAlign: 'center',
    },

    permissionButton: {
        backgroundColor: '#F28C4B',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginBottom: 12,
    },

    backButton: {
        backgroundColor: '#5C4033',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 12,
    },

    buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },

    // =========================
    // TOP BAR
    // =========================

    topBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100,
        zIndex: 10,
    },

    backButtonTop: {
        position: 'absolute',
        top: 20,
        left: 20,

        width: 45,
        height: 45,

        borderRadius: 23,

        backgroundColor: 'rgba(0,0,0,0.6)',

        justifyContent: 'center',
        alignItems: 'center',
    },

    backText: {
        color: '#FFF',
        fontSize: 38,
        lineHeight: 42,
    },

    titleContainer: {
        marginTop: 20,
        marginLeft: 80,
        marginRight: 20,

        alignItems: 'center',
    },

    title: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: 'bold',
    },

    subtitle: {
        color: '#FFF',
        fontSize: 12,
        marginTop: 5,
        textAlign: 'center',
    },

    // =========================
    // SCAN BOX
    // =========================

    scanBox: {
        position: 'absolute',

        width: 250,
        height: 250,

        left: '50%',
        top: '50%',

        marginLeft: -125,
        marginTop: -125,

        zIndex: 5,
    },

    cornerTopLeft: {
        position: 'absolute',

        top: 0,
        left: 0,

        width: 40,
        height: 40,

        borderTopWidth: 4,
        borderLeftWidth: 4,

        borderColor: '#FFF',
    },

    cornerTopRight: {
        position: 'absolute',

        top: 0,
        right: 0,

        width: 40,
        height: 40,

        borderTopWidth: 4,
        borderRightWidth: 4,

        borderColor: '#FFF',
    },

    cornerBottomLeft: {
        position: 'absolute',

        bottom: 0,
        left: 0,

        width: 40,
        height: 40,

        borderBottomWidth: 4,
        borderLeftWidth: 4,

        borderColor: '#FFF',
    },

    cornerBottomRight: {
        position: 'absolute',

        bottom: 0,
        right: 0,

        width: 40,
        height: 40,

        borderBottomWidth: 4,
        borderRightWidth: 4,

        borderColor: '#FFF',
    },

    // =========================
    // BOTTOM
    // =========================

    bottomContainer: {
        position: 'absolute',

        left: 0,
        right: 0,
        bottom: 60,

        alignItems: 'center',

        zIndex: 10,
    },

    scanText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: 'bold',

        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: {
            width: 1,
            height: 1,
        },
        textShadowRadius: 3,
    },

    scanSubText: {
        color: '#FFF',
        fontSize: 13,
        marginTop: 6,

        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: {
            width: 1,
            height: 1,
        },
        textShadowRadius: 3,
    },

});
