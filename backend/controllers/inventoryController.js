const inventoryModel = require("../models/inventoryModel")

// Lấy danh sách toàn bộ vật tư y tế trong kho
async function index(req, res) {
    try {
        const materials = await inventoryModel.getAllMaterials()
        res.json({
            success: true,
            materials
        })
    } catch (error) {
        console.error("Lỗi lấy danh sách vật tư kho:", error)
        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống khi lấy danh sách kho vật tư."
        })
    }
}

// Cập nhật số lượng vật tư tồn kho thực tế
async function update(req, res) {
    try {
        const id = req.params.id
        const { name, unit, quantity, min_quantity } = req.body

        if (!name || !unit || quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập đầy đủ tên vật tư, đơn vị và số lượng tồn."
            })
        }

        const material = await inventoryModel.getMaterialById(id)
        if (!material) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy vật tư y tế yêu cầu."
            })
        }

        // Thực hiện cập nhật số lượng tồn kho mới vào bảng materials
        await inventoryModel.updateMaterial(id, name, unit, quantity, min_quantity || 10)
        
        res.json({
            success: true,
            message: "Cập nhật kho vật tư thành công."
        })
    } catch (error) {
        console.error("Lỗi cập nhật kho vật tư:", error)
        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống khi cập nhật kho vật tư."
        })
    }
}

// Thêm mới một loại vật tư y tế vào danh mục kho
async function store(req, res) {
    try {
        const { name, unit, quantity, min_quantity } = req.body

        if (!name || !unit || quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập đầy đủ thông tin."
            })
        }

        await inventoryModel.createMaterial(name, unit, quantity, min_quantity || 10)
        
        res.status(201).json({
            success: true,
            message: "Thêm vật tư y tế mới thành công."
        })
    } catch (error) {
        console.error("Lỗi thêm vật tư kho:", error)
        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống."
        })
    }
}

module.exports = {
    index,
    update,
    store
}
