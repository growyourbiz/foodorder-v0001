// data.js

const menuItems = [
    {
        id: 'pad-thai',
        name: 'ผัดไทยกุ้งสด',
        image: 'images/pad-thai.jpg', // ใช้ลิงก์รูปภาพที่คุณอัปโหลด
        prices: {
            small: 70,
            medium: 85,
            large: 100
        },
        defaultSize: 'medium',
        description: 'ผัดไทยเส้นจันท์เหนียวนุ่มคลุกซอสเข้มข้น หอมกลมกล่อม พร้อมกุ้งสดตัวโต'
    },
    {
        id: 'khao-pad',
        name: 'ข้าวผัดทะเล',
        image: 'https://images.unsplash.com/photo-1628122108873-a611c0f0f5b9?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // ยังคงใช้ Unsplash หากไม่มีรูปใหม่
        prices: {
            medium: 90
        },
        defaultSize: 'medium',
        description: 'ข้าวผัดหอมๆ กับอาหารทะเลสดใหม่ กุ้ง ปลาหมึก เน้นๆ'
    },
    {
        id: 'tom-yum',
        name: 'ต้มยำกุ้งน้ำข้น',
        image: 'https://images.unsplash.com/photo-1625475654060-1596282f9d50?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // ยังคงใช้ Unsplash หากไม่มีรูปใหม่
        prices: {
            small: 120,
            medium: 150,
            large: 180
        },
        defaultSize: 'medium',
        description: 'ต้มยำกุ้งรสจัดจ้าน เผ็ดร้อน เปรี้ยวกลมกล่อม หอมเครื่องสมุนไพร'
    },
    {
        id: 'fried-chicken',
        name: 'ไก่ทอดหาดใหญ่',
        image: 'https://images.unsplash.com/photo-1610055013063-e382f9104a75?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // ยังคงใช้ Unsplash หากไม่มีรูปใหม่
        prices: {
            medium: 60
        },
        defaultSize: 'medium',
        description: 'ไก่ทอดกรอบนอกนุ่มใน หมักเครื่องเทศหอมๆ สูตรเด็ด'
    },
    {
        id: 'cola',
        name: 'โค้ก',
        image: 'images/cola.png', // ใช้ลิงก์รูปภาพที่คุณอัปโหลด
        prices: {
            medium: 20
        },
        defaultSize: 'medium',
        description: 'เครื่องดื่มดับกระหาย'
    }
];

// เงื่อนไขค่าจัดส่ง
const deliveryConditions = {
    freeDeliveryThreshold: 100, // ยอดรวมที่สูงกว่าหรือเท่ากับ 100 บาทจะส่งฟรี
    deliveryFee: 10             // ค่าจัดส่งปกติ
};
