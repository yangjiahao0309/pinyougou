//商家后台，商品控制层
app.controller('goodsController', function ($scope, $controller, $location, goodsService, itemCatService, typeTemplateService, uploadService) {

    $controller('baseController', {$scope: $scope});//继承

    //读取列表数据绑定到表单中  
    $scope.findAll = function () {
        goodsService.findAll().success(
            function (response) {
                $scope.list = response;
            }
        );
    };

    //分页
    $scope.findPage = function (page, rows) {
        goodsService.findPage(page, rows).success(
            function (response) {
                $scope.list = response.rows;
                $scope.paginationConf.totalItems = response.total;//更新总记录数
            }
        );
    };

    //查询实体
    $scope.findOne = function () {

        var id = $location.search()["id"];//获取页面跳转携带的id
        if (id == null) { //如果没有id，不是修改
            return;
        }
        goodsService.findOne(id).success(
            function (response) {
                //修改时基本内容回显
                $scope.entity = response;

                //向富文本编辑器添加内容
                editor.html($scope.entity.goodsDesc.introduction);

                //显示图片列表 将携带过来的itemImages转换成能显示的JSON格式
                $scope.entity.goodsDesc.itemImages = JSON.parse($scope.entity.goodsDesc.itemImages);

                //显示扩展属性
                $scope.entity.goodsDesc.customAttributeItems = JSON.parse($scope.entity.goodsDesc.customAttributeItems);

                //规格
                $scope.entity.goodsDesc.specificationItems = JSON.parse($scope.entity.goodsDesc.specificationItems);
                
                //SKU列表
                for (var i = 0;i<$scope.entity.itemList.length;i++){
                    $scope.entity.itemList[i].spec=JSON.parse($scope.entity.itemList[i].spec);
                }
            }
        );
    };

    //根据规格名称和规格选项确定复选框状态
    $scope.checkAttributeValue = function (specName, optionName) {

        var items = $scope.entity.goodsDesc.specificationItems;
        var object = $scope.searchObjectByKey(items, "attributeName", specName);
        if (object == null) {
            return false;
        } else {
            if (object.attributeValue.indexOf(optionName) >= 0) {
                return true;
            } else {
                return false;
            }
        }
    }

    //保存
    $scope.save = function () {
        //获取富文本编辑器的内容
        $scope.entity.goodsDesc.introduction = editor.html();
        var serviceObject;//服务层对象
        if ($scope.entity.goods.id != null) {//如果有ID
            serviceObject = goodsService.update($scope.entity); //修改
        } else {
            serviceObject = goodsService.add($scope.entity);//增加
        }
        serviceObject.success(
            function (response) {
                if (response.success) {

                    alert('保存成功');
                    $scope.entity={};
                    editor.html("");
                    location.href="goods.html";//跳转到商品列表页
                } else {
                    alert(response.message);
                }
            }
        );
    };


    $scope.add = function () {
        $scope.entity.goodsDesc.introduction = editor.html();
        goodsService.add($scope.entity).success(
            function (response) {
                if (response.success) {
                    alert(response.message);

                    $scope.entity = {};//保存成功后，清空实体
                    editor.html(''); //保存成功后，清空富文本编辑器
                    location.reload();//重新加载
                } else {
                    alert(response.message);
                }

            }
        );
    }


    //批量删除
    $scope.dele = function () {
        //获取选中的复选框
        goodsService.dele($scope.selectIds).success(
            function (response) {
                if (response.success) {
                    $scope.reloadList();//刷新列表
                    $scope.selectIds = [];
                }
            }
        );
    };

    $scope.searchEntity = {};//定义搜索对象

    //搜索
    $scope.search = function (page, rows) {
        goodsService.search(page, rows, $scope.searchEntity).success(
            function (response) {
                $scope.list = response.rows;
                $scope.paginationConf.totalItems = response.total;//更新总记录数
            }
        );
    }

    //上传图片
    $scope.uploadFile = function () {
        uploadService.uploadFile().success(
            function (response) {
                if (response.success) {//上传成功，取出url
                    $scope.image_entity.url = response.message;
                } else {
                    alert(response.message);
                }
            }).error(function () {
            alert("上传发生错误")
        });
    }


    $scope.entity = {goods: {}, goodsDesc: {itemImages: [], specificationItems: []}};//定义页面实体结构
    //添加图片列表
    $scope.add_image_entity = function () {
        $scope.entity.goodsDesc.itemImages.push($scope.image_entity);
    }

    //列表中移除图片
    $scope.remove_image_entity = function (index) {
        $scope.entity.goodsDesc.itemImages.splice(index, 1);
    }

    //一级商品分类
    $scope.selectItemCat1List = function () {
        itemCatService.findByParentId(0).success(
            function (response) {
                $scope.itemCat1List = response;
            }
        );
    }

    //读取二级分类
    $scope.$watch('entity.goods.category1Id', function (newValue, oldValue) {
        //根据选择的值，查询二级分类
        itemCatService.findByParentId(newValue).success(
            function (response) {
                $scope.itemCat2List = response;
            }
        );
    });

    //读取三级分类
    $scope.$watch('entity.goods.category2Id', function (newValue, oldValue) {
        //根据选择的值，查询二级分类
        itemCatService.findByParentId(newValue).success(
            function (response) {
                $scope.itemCat3List = response;
            }
        );
    });

    //三级分类选择后 读取模板 ID
    $scope.$watch('entity.goods.category3Id', function (newValue, oldValue) {
        itemCatService.findOne(newValue).success(
            function (response) {
                $scope.entity.goods.typeTemplateId = response.typeId; //更新模板 ID
            }
        );
    });

    //模板 ID 选择后 更新品牌列表
    $scope.$watch('entity.goods.typeTemplateId', function (newValue, oldValue) {
        typeTemplateService.findOne(newValue).success(
            function (response) {
                $scope.typeTemplate = response;//获取类型模板
                $scope.typeTemplate.brandIds = JSON.parse($scope.typeTemplate.brandIds);//品牌列表

                if ($location.search()["id"] == null) { //当没有id传递的时候执行此逻辑
                    //将模板中的扩展属性列表添加到商品的扩展属性中
                    $scope.entity.goodsDesc.customAttributeItems = JSON.parse($scope.typeTemplate.customAttributeItems);

                }

            }
        );

        typeTemplateService.findSpecList(newValue).success(
            function (response) {
                $scope.specList = response;
            }
        );
    });

    //更新规格状态
    $scope.updateSpecAttribute = function ($event, name, value) {
        var object = $scope.searchObjectByKey(
            $scope.entity.goodsDesc.specificationItems, 'attributeName', name);
        if (object != null) {
            if ($event.target.checked) {
                object.attributeValue.push(value);
            } else {//取消勾选
                object.attributeValue.splice(object.attributeValue.indexOf(value), 1);//移除选项

                //如果选项都取消了，将此条记录移除
                if (object.attributeValue.length == 0) {
                    $scope.entity.goodsDesc.specificationItems.splice(
                        $scope.entity.goodsDesc.specificationItems.indexOf(object), 1);
                }
            }
        } else {
            $scope.entity.goodsDesc.specificationItems.push(
                {"attributeName": name, "attributeValue": [value]});
        }
    }

    //创建规格SKU列表
    $scope.createItemList = function () {
        //定义一个初始的集合,赋值给entity.itemList
        $scope.entity.itemList = [{spec: {}, price: 0, num: 99999, status: '0', isDefault: '0'}];
        var items = $scope.entity.goodsDesc.specificationItems;
        for (var i = 0; i < items.length; i++) {
            $scope.entity.itemList = addColumn($scope.entity.itemList, items[i].attributeName, items[i].attributeValue);
        }

    }

    //添加规格选项列
    addColumn = function (list, columnName, columnValues) {
        //定义一个新集合
        var newList = [];

        for (var i = 0; i < list.length; i++) {
            //获取集合中的每一行
            var oldRow = list[i];
            //遍历新添加的规格选项的规格内容
            for (var j = 0; j < columnValues.length; j++) {
                //将前集合中的每一行深克隆，添加新的规格内容
                var newRow = JSON.parse(JSON.stringify(oldRow));
                newRow.spec[columnName] = columnValues[j];
                //将新的一行添加到新集合中
                newList.push(newRow);
            }
        }
        return newList;
    }

    //定义一个商品状态数据
    $scope.status = ['未审核', '已审核', '审核未通过', '关闭'];

    //定义一个商品分类数组
    $scope.itemCatList = [];

    $scope.findItemCatList = function () {
        itemCatService.findAll().success( //查询所有商品分类
            function (response) {
                for (var i = 0; i < response.length; i++) {
                    $scope.itemCatList[response[i].id] = response[i].name;//将分类名称添加到数组对应id位置
                }

            }
        );
    }

    $scope.isMarketable=['未上架','已上架'];//商品上架状态

    $scope.isMarketableStr=['下架','上架'];

    //批量修改商品上架状态
    $scope.updateIsMarketable=function (status) {

            if(confirm("确定要"+$scope.isMarketableStr[status]+"吗？")) {
                goodsService.updateIsMarketable($scope.selectIds, status).success(
                    function (response) {

                        if (response.success) {//修改成功
                            alert(response.message);
                            $scope.reloadList();//刷新列表
                            $scope.selectIds = [];//清空 ID 集合
                        } else {
                            alert(response.message);
                        }

                    }
                );
            }
        }



});	
