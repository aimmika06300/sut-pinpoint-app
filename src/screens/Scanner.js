import React, { useState } from 'react';
import {
    Alert,
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

    // ยังตรวจสอบ permission อยู่
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

    // ถ้ากล้องเปิดไม่ได้
    const handleCameraError = (error) => {
        console.log('CAMERA ERROR:', error);

        Alert.alert(
            'Camera Error',
            error?.message || 'ไม่สามารถเปิดกล้องได้'
        );
    };

    // เมื่อสแกน QR
    const handleBarcodeScanned = ({ data }) => {
        if (scanned) return;

        setScanned(true);

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

            {/* กล้อง */}
            <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                active={true}
                onMountError={(error) => {
                    console.log('CAMERA ERROR:', error);

                    Alert.alert(
                        'Camera Error',
                        error?.message || 'เปิดกล้องไม่ได้'
                    );
                }}
            />

            {/* ปุ่มกลับ */}
            <TouchableOpacity
                style={styles.backButtonTop}
                onPress={onBack}
            >
                <Text style={styles.backText}>
                    ‹
                </Text>
            </TouchableOpacity>

            {/* ข้อความด้านบน */}
            <View style={styles.titleContainer}>
                <Text style={styles.title}>
                    Scan QR Code
                </Text>

                <Text style={styles.subtitle}>
                    สแกน QR Code เพื่อดูข้อมูลสถานที่
                </Text>
            </View>

            {/* กรอบสแกน */}
            <View style={styles.scanBox}>

                <View style={styles.cornerTopLeft} />

                <View style={styles.cornerTopRight} />

                <View style={styles.cornerBottomLeft} />

                <View style={styles.cornerBottomRight} />

            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },

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
        zIndex: 10,
    },

    backText: {
        color: '#FFF',
        fontSize: 38,
        lineHeight: 42,
    },

    titleContainer: {
        position: 'absolute',
        top: 30,
        left: 80,
        right: 20,
        alignItems: 'center',
        zIndex: 5,
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
    },

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
});