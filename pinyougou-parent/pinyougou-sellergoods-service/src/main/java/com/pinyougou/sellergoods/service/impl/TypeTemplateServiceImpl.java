package com.pinyougou.sellergoods.service.impl;

import java.util.List;
import java.util.Map;

import com.alibaba.fastjson.JSON;
import com.pinyougou.mapper.TbSpecificationOptionMapper;
import com.pinyougou.pojo.TbSpecificationOption;
import com.pinyougou.pojo.TbSpecificationOptionExample;
import org.springframework.beans.factory.annotation.Autowired;
import com.alibaba.dubbo.config.annotation.Service;
import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.pinyougou.mapper.TbTypeTemplateMapper;
import com.pinyougou.pojo.TbTypeTemplate;
import com.pinyougou.pojo.TbTypeTemplateExample;
import com.pinyougou.pojo.TbTypeTemplateExample.Criteria;
import com.pinyougou.sellergoods.service.TypeTemplateService;

import entity.PageResult;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.transaction.annotation.Transactional;

/**
 * 服务实现层
 *
 * @author Administrator
 */
@Service
@Transactional
public class TypeTemplateServiceImpl implements TypeTemplateService {

    @Autowired
    private TbTypeTemplateMapper typeTemplateMapper;

    @Autowired
    private TbSpecificationOptionMapper specificationOptionMapper;

    @Autowired
    private RedisTemplate redisTemplate;

    /**
     * 查询全部
     */
    @Override
    public List<TbTypeTemplate> findAll() {
        return typeTemplateMapper.selectByExample(null);
    }

    /**
     * 按分页查询
     */
    @Override
    public PageResult findPage(int pageNum, int pageSize) {
        PageHelper.startPage(pageNum, pageSize);
        Page<TbTypeTemplate> page = (Page<TbTypeTemplate>) typeTemplateMapper.selectByExample(null);
        return new PageResult(page.getTotal(), page.getResult());
    }

    /**
     * 增加
     */
    @Override
    public void add(TbTypeTemplate typeTemplate) {
        typeTemplateMapper.insert(typeTemplate);
    }


    /**
     * 修改
     */
    @Override
    public void update(TbTypeTemplate typeTemplate) {
        typeTemplateMapper.updateByPrimaryKey(typeTemplate);
    }

    /**
     * 根据ID获取实体
     *
     * @param id
     * @return
     */
    @Override
    public TbTypeTemplate findOne(Long id) {
        return typeTemplateMapper.selectByPrimaryKey(id);
    }

    /**
     * 批量删除
     */
    @Override
    public void delete(Long[] ids) {
        for (Long id : ids) {
            typeTemplateMapper.deleteByPrimaryKey(id);
        }
    }


    @Override
    public PageResult findPage(TbTypeTemplate typeTemplate, int pageNum, int pageSize) {
        PageHelper.startPage(pageNum, pageSize);

        TbTypeTemplateExample example = new TbTypeTemplateExample();
        Criteria criteria = example.createCriteria();

        if (typeTemplate != null) {
            if (typeTemplate.getName() != null && typeTemplate.getName().length() > 0) {
                criteria.andNameLike("%" + typeTemplate.getName() + "%");
            }
            if (typeTemplate.getSpecIds() != null && typeTemplate.getSpecIds().length() > 0) {
                criteria.andSpecIdsLike("%" + typeTemplate.getSpecIds() + "%");
            }
            if (typeTemplate.getBrandIds() != null && typeTemplate.getBrandIds().length() > 0) {
                criteria.andBrandIdsLike("%" + typeTemplate.getBrandIds() + "%");
            }
            if (typeTemplate.getCustomAttributeItems() != null && typeTemplate.getCustomAttributeItems().length() > 0) {
                criteria.andCustomAttributeItemsLike("%" + typeTemplate.getCustomAttributeItems() + "%");
            }

        }

        Page<TbTypeTemplate> page = (Page<TbTypeTemplate>) typeTemplateMapper.selectByExample(example);

        //调用方法，将品牌、规格信息存入缓存
        saveRedis();

        return new PageResult(page.getTotal(), page.getResult());
    }

    /**
     * 将品牌和规格数据存入缓存
     */
    private void saveRedis() {

        //获取所有模板信息
        List<TbTypeTemplate> templateList = findAll();
        //遍历，获取每一个模板对象
        for (TbTypeTemplate tbTypeTemplate : templateList) {
            //品牌
            //将品牌JSON数据转换成list集合
            List<Map> brandList = JSON.parseArray(tbTypeTemplate.getBrandIds(), Map.class);
            //将品牌数据存入缓存中 格式： 模板id:品牌列表
            redisTemplate.boundHashOps("brandList").put(tbTypeTemplate.getId(), brandList);

            //规格
            //根据规格id查询规格列表
            List<Map> specList = findSpecList(tbTypeTemplate.getId());
            //存入数据
            redisTemplate.boundHashOps("specList").put(tbTypeTemplate.getId(), specList);

        }

        System.out.println("更新缓存:商品品牌、规格表");

    }

    /**
     * 模板下拉列表
     *
     * @return
     */
    @Override
    public List<Map> selectOptionList() {
        return typeTemplateMapper.selectOptionList();
    }

    /**
     * 返回规格列表
     *
     * @param id
     * @return
     */
    @Override
    public List<Map> findSpecList(Long id) {
        //根据模板ID查询对应模板
        TbTypeTemplate tbTypeTemplate = typeTemplateMapper.selectByPrimaryKey(id);
        //将模板字符串内容转换成JSON
        List<Map> list = JSON.parseArray(tbTypeTemplate.getSpecIds(), Map.class);

        for (Map map : list) {

            TbSpecificationOptionExample example = new TbSpecificationOptionExample();
            TbSpecificationOptionExample.Criteria criteria = example.createCriteria();
            //获取map结合中的id值，将其转换成Long类型
            criteria.andSpecIdEqualTo(new Long((Integer) map.get("id")));
            //根据规格选项id获取规格选项内容
            List<TbSpecificationOption> tbSpecificationOptions = specificationOptionMapper.selectByExample(example);
            map.put("tbSpecificationOptions", tbSpecificationOptions);
        }

        return list;
    }

    @Override
    public Map findOneOption(Long id) {
        return typeTemplateMapper.findOneOption(id);
    }


}
