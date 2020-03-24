import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Body,
  ValidationPipe,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { User } from 'src/auth/user.decorator';
import { OptionalAuthGuard } from 'src/auth/optional-auth.gaurd';
import { CreateCommentDTO, CommentResponse } from 'src/models/comment.models';
import { UserEntity } from 'src/entities/user.entity';
import {
  CreateArticleDTO,
  UpdateArticleDTO,
  FindAllQuery,
  FindFeedQuery,
  ArticleResponse,
} from 'src/models/article.models';
import { CommentsService } from './comments.service';
import { ArticleService } from './article.service';
import { ResponseObject } from 'src/models/response.model';

@Controller('articles')
export class ArticleController {
  constructor(
    private articleService: ArticleService,
    private commentService: CommentsService,
  ) {}

  @Get()
  @UseGuards(new OptionalAuthGuard())
  async findAll(
    @User() user: UserEntity,
    @Query() query: FindAllQuery,
  ): Promise<
    ResponseObject<'articles', ArticleResponse[]> &
      ResponseObject<'articlesCount', number>
  > {
    const articles = await this.articleService.findAll(user, query);
    return {
      articles,
      articlesCount: articles.length,
    };
  }

  @Get('/feed')
  @UseGuards(AuthGuard())
  async findFeed(
    @User() user: UserEntity,
    @Query() query: FindFeedQuery,
  ): Promise<
    ResponseObject<'articles', ArticleResponse[]> &
      ResponseObject<'articlesCount', number>
  > {
    const articles = await this.articleService.findFeed(user, query);
    return { articles, articlesCount: articles.length };
  }

  @Get('/:slug')
  @UseGuards(new OptionalAuthGuard())
  async findBySlug(
    @Param('slug') slug: string,
    @User() user: UserEntity,
  ): Promise<ResponseObject<'article', ArticleResponse>> {
    const article = await this.articleService.findBySlug(slug);
    return { article: article.toArticle(user) };
  }

  @Post()
  @UseGuards(AuthGuard())
  async createArticle(
    @User() user: UserEntity,
    @Body('article', ValidationPipe) data: CreateArticleDTO,
  ): Promise<ResponseObject<'article', ArticleResponse>> {
    const article = await this.articleService.createArticle(user, data);
    return { article };
  }

  @Put('/:slug')
  @UseGuards(AuthGuard())
  async updateArticle(
    @Param('slug') slug: string,
    @User() user: UserEntity,
    @Body('article', ValidationPipe) data: UpdateArticleDTO,
  ): Promise<ResponseObject<'article', ArticleResponse>> {
    const article = await this.articleService.updateArticle(slug, user, data);
    return { article };
  }

  @Delete('/:slug')
  @UseGuards(AuthGuard())
  async deleteArticle(
    @Param() slug: string,
    @User() user: UserEntity,
  ): Promise<ResponseObject<'article', ArticleResponse>> {
    const article = await this.articleService.deleteArticle(slug, user);
    return { article };
  }

  @Get('/:slug/comments')
  async findComments(
    @Param('slug') slug: string,
  ): Promise<ResponseObject<'comments', CommentResponse[]>> {
    const comments = await this.commentService.findByArticleSlug(slug);
    return { comments };
  }

  @Post('/:slug/comments')
  async createComment(
    @User() user: UserEntity,
    @Body('comment', ValidationPipe) data: CreateCommentDTO,
  ): Promise<ResponseObject<'comment', CommentResponse>> {
    const comment = await this.commentService.createComment(user, data);
    return { comment };
  }

  @Delete('/:slug/comments/:id')
  async deleteComment(
    @User() user: UserEntity,
    @Param('id') id: number,
  ): Promise<ResponseObject<'comment', CommentResponse>> {
    const comment = await this.commentService.deleteComment(user, id);
    return { comment };
  }

  @Post('/:slug/favorite')
  @UseGuards(AuthGuard())
  async favoriteArticle(
    @Param('slug') slug: string,
    @User() user: UserEntity,
  ): Promise<ResponseObject<'article', ArticleResponse>> {
    const article = await this.articleService.favoriteArticle(slug, user);
    return { article };
  }

  @Delete('/:slug/favorite')
  @UseGuards(AuthGuard())
  async unfavoriteArticle(
    @Param('slug') slug: string,
    @User() user: UserEntity,
  ): Promise<ResponseObject<'article', ArticleResponse>> {
    const article = await this.articleService.unfavoriteArticle(slug, user);
    return { article };
  }
}
