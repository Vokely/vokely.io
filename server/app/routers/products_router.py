from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from models.product import Product, ProductCreate, ProductUpdate, ProductListResponse
from crud.products import ProductCRUD
from db.config import get_database

router = APIRouter()

async def get_product_crud():
    db = await get_database()
    return ProductCRUD(db)

@router.get("/products", response_model=ProductListResponse)
async def list_products(
    is_archived: Optional[bool] = Query(None, description="Filter by archived status"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=100, description="Items per page"),
    product_crud: ProductCRUD = Depends(get_product_crud)
):
    """Get a list of products with optional filtering"""
    try:
        products, total = await product_crud.get_products(
            is_archived=is_archived,
            page=page,
            per_page=per_page
        )
        
        return ProductListResponse(
            products=products,
            total=total,
            page=page,
            per_page=per_page
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching products: {str(e)}")

@router.get("/products/{product_id}", response_model=Product)
async def get_product(
    product_id: str,
    product_crud: ProductCRUD = Depends(get_product_crud)
):
    """Get a specific product by ID"""
    try:
        product = await product_crud.get_product(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return product
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching product: {str(e)}")

@router.post("/products", response_model=Product)
async def create_product(
    product: ProductCreate,
    product_crud: ProductCRUD = Depends(get_product_crud)
):
    """Create a new product"""
    try:
        return await product_crud.create_product(product)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating product: {str(e)}")

@router.put("/products/{product_id}", response_model=Product)
async def update_product(
    product_id: str,
    product_update: ProductUpdate,
    product_crud: ProductCRUD = Depends(get_product_crud)
):
    """Update a product"""
    try:
        product = await product_crud.update_product(product_id, product_update)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return product
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating product: {str(e)}")

@router.delete("/products/{product_id}")
async def delete_product(
    product_id: str,
    product_crud: ProductCRUD = Depends(get_product_crud)
):
    """Delete a product"""
    try:
        success = await product_crud.delete_product(product_id)
        if not success:
            raise HTTPException(status_code=404, detail="Product not found")
        return {"message": "Product deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting product: {str(e)}")