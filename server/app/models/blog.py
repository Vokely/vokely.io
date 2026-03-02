from pydantic import BaseModel, HttpUrl, Field
from typing import List, Optional, Literal, Union
from datetime import datetime

class Paragraph(BaseModel):
    type: Literal["paragraph"]
    text: str

class Heading(BaseModel):
    type: Literal["heading"]
    level: int = Field(..., ge=1, le=6)
    text: str

class Link(BaseModel):
    type: Literal["link"]
    text: str
    url: str  
    openInNewTab: Optional[bool] = False

class Item(BaseModel):
    text: str

class ListItem(BaseModel):
    type: Literal["list"]
    style: Literal["unordered", "ordered"]
    items: List[Item]

BlogContentBlock = Union[Paragraph, Heading, ListItem, Link]

class BlogPost(BaseModel):
    title: str
    description: str
    image: Optional[HttpUrl] = ""
    publishedAt: datetime
    updatedAt: datetime
    featured: bool = Field(default=False)
    author: str
    isPublished: bool
    tags: List[str]
    slug: str
    content: List[BlogContentBlock]
    isCoverImage: bool = False

class AllBlogsResponse(List[BlogPost]):
    id: str
